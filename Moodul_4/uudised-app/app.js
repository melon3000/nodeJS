// app.js
const express = require('express');
const { body, validationResult } = require('express-validator');

const {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
} = require('./database');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));

// Avaleht – list pealkirjadena + msg
app.get('/', async (req, res) => {
  const news = await getNews();
  res.render('index', { news, msg: req.query.msg || null });
});

// Lisa uudis (GET) – saadame tühjad errors/values (nagu moodulis)
app.get('/news/create', (req, res) => {
  res.render('news_create', { errors: [], values: {} });
});

// Lisa uudis (POST) – serveripoolne valideerimine + saniteerimine
app.post(
  '/news/create',
  [
    body('title').trim().notEmpty().withMessage('Pealkiri on kohustuslik').escape(),
    body('content').trim().notEmpty().withMessage('Sisu on kohustuslik').escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    const values = {
      title: req.body.title,
      content: req.body.content,
    };

    if (!errors.isEmpty()) {
      return res.status(400).render('news_create', { errors: errors.array(), values });
    }

    const ok = await createNews(values.title, values.content);

    if (ok) return res.redirect('/?msg=created');
    return res.redirect('/?msg=create_failed');
  }
);

// Uudise detailvaade
app.get('/news/:id', async (req, res) => {
  const id = req.params.id;
  const news = await getNewsById(id);

  if (!news) return res.status(404).render('404');
  res.render('news', { news });
});

// Muuda (GET) – vorm olemasolevate andmetega
app.get('/news/:id/edit', async (req, res) => {
  const id = req.params.id;
  const news = await getNewsById(id);

  if (!news) return res.status(404).render('404');

  // sama loogika: errors/values, et vorm saaks vajadusel uuesti avaneda
  res.render('edit', { news, errors: [], values: { title: news.title, content: news.content } });
});

// Muuda (POST) – valideerimine + saniteerimine
app.post(
  '/news/:id/edit',
  [
    body('title').trim().notEmpty().withMessage('Pealkiri on kohustuslik').escape(),
    body('content').trim().notEmpty().withMessage('Sisu on kohustuslik').escape(),
  ],
  async (req, res) => {
    const id = req.params.id;
    const errors = validationResult(req);

    const values = {
      title: req.body.title,
      content: req.body.content,
    };

    // news vaja uuesti vormi kuvamiseks
    const news = await getNewsById(id);
    if (!news) return res.status(404).render('404');

    if (!errors.isEmpty()) {
      return res.status(400).render('edit', { news: { ...news }, errors: errors.array(), values });
    }

    await updateNews(id, values.title, values.content);
    res.redirect(`/news/${id}`);
  }
);

// Kustuta (POST) – vormiga (nagu moodulis) + msg query
app.post('/news/delete', async (req, res) => {
  const { id } = req.body;

  const deleted = await deleteNews(id);

  if (deleted) return res.redirect('/?msg=deleted');
  return res.redirect('/?msg=delete_failed');
});

// 404
app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(3000, () => console.log('http://localhost:3000'));