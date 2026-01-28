const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

const {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getAllNewsAdmin,
  getUserByUsername,
  createUser,
} = require('./database');

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

// SESSION
app.use(
  session({
    secret: 'change_this_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 2, // 2h
      httpOnly: true,
      // secure: true, // only HTTPS
    },
  })
);

// user in templates + isAdmin helper
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAdmin = !!req.session.user && req.session.user.username === 'admin';
  next();
});

function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/?msg=login_required');
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user) return res.redirect('/?msg=login_required');
  if (req.session.user.username !== 'admin') return res.redirect('/?msg=forbidden');
  next();
}

function canEditOrDelete(newsRow, sessionUser) {
  if (!sessionUser) return false;
  if (sessionUser.username === 'admin') return true;
  if (!newsRow || !newsRow.user_id) return false;
  return Number(newsRow.user_id) === Number(sessionUser.id);
}

// HOME
app.get('/', async (req, res) => {
  const news = await getNews();
  res.render('index', { news, msg: req.query.msg || null });
});

// REGISTER
app.get('/register', (req, res) => {
  res.render('register', { errors: [], values: {}, msg: req.query.msg || null });
});

app.post(
  '/register',
  [
    body('username').trim().notEmpty().withMessage('Username on kohustuslik').escape(),
    body('password').trim().isLength({ min: 4 }).withMessage('Parool min 4 märki'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const values = { username: req.body.username };

    if (!errors.isEmpty()) {
      return res.status(400).render('register', { errors: errors.array(), values, msg: null });
    }

    const existing = await getUserByUsername(values.username);
    if (existing) {
      return res.status(400).render('register', {
        errors: [{ msg: 'Kasutajanimi on juba olemas' }],
        values,
        msg: null,
      });
    }

    const hash = await bcrypt.hash(req.body.password, 10);
    const ok = await createUser(values.username, hash);

    if (ok) return res.redirect('/login?msg=registered');
    return res.redirect('/register?msg=failed');
  }
);

// LOGIN
app.get('/login', (req, res) => {
  res.render('login', { errors: [], values: {}, msg: req.query.msg || null });
});

app.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Username on kohustuslik').escape(),
    body('password').trim().notEmpty().withMessage('Parool on kohustuslik'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const values = { username: req.body.username };

    if (!errors.isEmpty()) {
      return res.status(400).render('login', { errors: errors.array(), values, msg: null });
    }

    const user = await getUserByUsername(values.username);
    if (!user) {
      return res.status(400).render('login', {
        errors: [{ msg: 'Vale kasutajanimi või parool' }],
        values,
        msg: null,
      });
    }

    const ok = await bcrypt.compare(req.body.password, user.password_hash);
    if (!ok) {
      return res.status(400).render('login', {
        errors: [{ msg: 'Vale kasutajanimi või parool' }],
        values,
        msg: null,
      });
    }

    req.session.user = { id: user.id, username: user.username };
    return res.redirect('/');
  }
);

// LOGOUT
app.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// CREATE NEWS (protected)
app.get('/news/create', requireAuth, (req, res) => {
  res.render('news_create', { errors: [], values: {} });
});

app.post(
  '/news/create',
  requireAuth,
  [
    body('title').trim().notEmpty().withMessage('Pealkiri on kohustuslik').escape(),
    body('content').trim().notEmpty().withMessage('Sisu on kohustuslik').escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const values = { title: req.body.title, content: req.body.content };

    if (!errors.isEmpty()) {
      return res.status(400).render('news_create', { errors: errors.array(), values });
    }

    const ok = await createNews(values.title, values.content, req.session.user.id);
    return res.redirect(ok ? '/?msg=created' : '/?msg=create_failed');
  }
);

// DETAIL
app.get('/news/:id', async (req, res) => {
  const news = await getNewsById(req.params.id);
  if (!news) return res.status(404).render('404');

  const canManage = canEditOrDelete(news, req.session.user);
  res.render('news', { news, canManage });
});

// EDIT (only owner or admin)
app.get('/news/:id/edit', requireAuth, async (req, res) => {
  const news = await getNewsById(req.params.id);
  if (!news) return res.status(404).render('404');

  if (!canEditOrDelete(news, req.session.user)) {
    return res.redirect('/?msg=forbidden');
  }

  res.render('edit', { news, errors: [], values: { title: news.title, content: news.content } });
});

app.post(
  '/news/:id/edit',
  requireAuth,
  [
    body('title').trim().notEmpty().withMessage('Pealkiri on kohustuslik').escape(),
    body('content').trim().notEmpty().withMessage('Sisu on kohustuslik').escape(),
  ],
  async (req, res) => {
    const news = await getNewsById(req.params.id);
    if (!news) return res.status(404).render('404');

    if (!canEditOrDelete(news, req.session.user)) {
      return res.redirect('/?msg=forbidden');
    }

    const errors = validationResult(req);
    const values = { title: req.body.title, content: req.body.content };

    if (!errors.isEmpty()) {
      return res.status(400).render('edit', { news, errors: errors.array(), values });
    }

    await updateNews(req.params.id, values.title, values.content);
    res.redirect(`/news/${req.params.id}`);
  }
);

// DELETE (only owner or admin)
app.post('/news/delete', requireAuth, async (req, res) => {
  const news = await getNewsById(req.body.id);
  if (!news) return res.redirect('/?msg=delete_failed');

  if (!canEditOrDelete(news, req.session.user)) {
    return res.redirect('/?msg=forbidden');
  }

  const deleted = await deleteNews(req.body.id);
  return res.redirect(deleted ? '/?msg=deleted' : '/?msg=delete_failed');
});

// ADMIN PANEL (admin only)
app.get('/admin', requireAdmin, async (req, res) => {
  const sort = req.query.sort || 'created_at';
  const dir = req.query.dir || 'desc';

  const rows = await getAllNewsAdmin(sort, dir);
  res.render('admin', { rows, sort, dir });
});

// 404
app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(3000, () => console.log('http://localhost:3000'));


app.use((err, req, res, next) => {
  console.error('DB/APP ERROR:', err);
  res.status(500).send('Server error');
});

app.use((err, req, res, next) => {
  console.error('ERROR CODE:', err.code);
  console.error('ERROR MESSAGE:', err.message);
  console.error(err);
  res.status(500).send('Server error');
});
