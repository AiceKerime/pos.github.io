const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const saltRounds = 10;
const { isLoggedIn } = require('../helpers/util')

module.exports = (db) => {
  // GET & VIEW DATA
  router.get('/', isLoggedIn, async (req, res, next) => {
    try {
      const data = await db.query('SELECT * FROM public."usersAccount"')

      res.render('userPages/users', { user: req.session.user, data: data.rows });
    } catch (err) {
      console.log(err)
      res.send(err)
    }
  });


  // ADD DATA
  router.get('/add', isLoggedIn, async (req, res, next) => {
    const data = await db.query('SELECT * FROM public."usersAccount"')

    res.render('userPages/add', { user: req.session.user, data: data.rows });
  });

  router.post('/add', isLoggedIn, async (req, res, next) => {
    try {
      const { email, name, password, role } = req.body
      const { rows: emails } = await db.query('SELECT * FROM public."usersAccount" WHERE email = $1', [email])
      if (emails.length > 0) {
        req.flash('error', `Email already exist`)
        return res.redirect('/add')
      }

      const hash = bcrypt.hashSync(password, saltRounds)
      await db.query('INSERT INTO public."usersAccount" (email, name, password, role) VALUES ($1, $2, $3, $4)', [email, name, hash, role])

      res.redirect('/users')
    } catch (error) {
      console.log(error)
      res.send(error)
    }
  })

  // EDIT DATA
  router.get('/edit/:userid', isLoggedIn, async (req, res, next) => {
    const { userid } = req.params

    const { rows: data } = await db.query('SELECT * FROM public."usersAccount" WHERE userid = $1', [userid])

    res.render('userPages/edit', { user: req.session.user, item: data[0] });
  });

  router.post('/edit/:userid', isLoggedIn, async (req, res, next) => {
    try {
      const { userid } = req.params
      const { email, name, role } = req.body

      const { rows: emails } = await db.query('SELECT * FROM public."usersAccount" WHERE email = $1', [email])
      if (emails.length > 0) {
        req.flash('error', `Email already exist`)
        return res.redirect('/edit')
      }

      await db.query('UPDATE public."usersAccount" SET email = $1, name = $2, role = $3 WHERE userid = $4', [email, name, role, userid])

      res.redirect('/users')
    } catch (error) {
      console.log(error)
      res.send(error)
    }
  })

  // DELETE DATA
  router.get('/delete/:userid', isLoggedIn, async (req, res, next) => {
    try {
      await db.query('DELETE FROM public."usersAccount" WHERE userid = $1', [req.params.userid])

      res.redirect('/users');
    } catch (err) {
      console.log(err)
      res.send(err)
    }
  });
  return router;
}
