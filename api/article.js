const queries = require('./queries')

module.exports = app => {
    const { existsOrError } = app.api.validation

    const save = (req, res) => {
        const article = { ...req.body }

        //if(req.params.id)
        //    article.id = req.params.id

        req.params.id && (article.id = req.params.id)

        try {
            existsOrError(article.name, "Name not provided.")
            existsOrError(article.description, "Description not provided.")
            existsOrError(article.categorieId, "Category not provided.")
            existsOrError(article.userId, "Author not provided.")
            existsOrError(article.content, "Content not provided.")
        } catch (msg) {
            return res.status(400).send(msg)
        }

        if (article.id) {
            app.db('articles')
                .update(article)
                .where({ id: article.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            app.db('articles')
                .insert(article)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }

    const remove = async (req, res) => {
        try {
            existsOrError(req.params.id, 'Article code not provided.')

            const rowsDeleted = await app.db('articles')
                .where({ id: req.params.id })
                .del()

            try {
                existsOrError(rowsDeleted, 'Article not found.')
            } catch (msg) {
                return res.status(400).send(msg)
            }            

            res.status(204).send()
        } catch (msg) {
            res.status(500).send(msg)
        }
    }

    const limit = 4 // Used for pagination

    const get = async (req, res) => {
        const page = req.query.page || 1
        const result = await app.db('articles').count('id').first()
        const count = parseInt(result.count)
        
        app.db('articles')
            .select('id', 'name', 'description')
            .limit(limit)
            .offset(page * limit - limit)
            .then(articles => res.json({
                data: articles,
                count,
                limit
            }))
            .catch(err => res.status(500).send(err))
    }

    const getById = (req, res) => {
        app.db('articles')
            //.select('id', 'name')
            .where({ id: req.params.id })
            .first()
            .then(article => {
                article.content = article.content.toString()
                res.json(article)
            })
            .catch(err => res.status(500).send(err))
    }

    const getByCategory = async (req, res) => {
        const categoryId = req.params.id
        const page = req.query.page || 1
        const categories = await app.db.raw(queries.categoryWithChildren, categoryId)
        const ids = categories.rows.map(c => c.id)

        app.db({a: 'articles', u: 'users'})
            .select('a.id', 'a.name', 'a.description', 'a.imageUrl', {author: 'u.name'})
            .limit(limit)
            .offset(page * limit - limit)
            .whereRaw('?? = ??', ['u.id', 'a.userId'])
            .whereIn('categorieId', ids)
            .orderBy('a.id','desc')
            .then(articles => res.json(articles))
            .catch(err => res.status(500).send(err))
    }

    return {
        save,
        remove,
        get,
        getById,
        getByCategory
    }
}    