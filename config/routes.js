const admin = require('./admin')

/* Method not using consign
const user = require('../api/user')
module.exports = app => {
    app.route('/users')
        .post(user().save)
         **** OR ****
        .post(user.save)
} */

// Method not using consign

module.exports = app => {

    app.post('/signup', app.api.user.save)
    app.post('/signin', app.api.auth.signin)
    app.post('/validateToken', app.api.auth.validateToken)

    app.route('/users')
        .all(app.config.passport.authenticate())
        .post(admin(app.api.user.save))
        .get(admin(app.api.user.get))

    app.route('/users/:id')
        .all(app.config.passport.authenticate())
        .put(admin(app.api.user.save))
        .get(admin(app.api.user.get))
        .delete(admin(app.api.user.remove))

    app.route('/categories')
        .all(app.config.passport.authenticate())
        .get(app.api.category.get)
        .post(admin(app.api.category.save))
    
    // The order is important!!
    app.route('/categories/tree')
        .get(app.api.category.getTree)
        .all(app.config.passport.authenticate())

    app.route('/categories/:id')
        .get(app.api.category.getById)
        .all(app.config.passport.authenticate())        
        .put(admin(app.api.category.save))
        .delete(admin(app.api.category.remove))

    app.route('/articles')
        .all(app.config.passport.authenticate())
        .get(admin(app.api.article.get))
        .post(admin(app.api.article.save))     

    app.route('/articles/:id')
        .get(app.api.article.getById)    
        .all(app.config.passport.authenticate())         
        .put(admin(app.api.article.save))
        .delete(admin(app.api.article.remove))

    app.route('/categories/:id/articles')
        .get(app.api.article.getByCategory)    
        .all(app.config.passport.authenticate())
        

    app.route('/stats')
        .get(app.api.stat.get)    
        .all(app.config.passport.authenticate())
        
        
}