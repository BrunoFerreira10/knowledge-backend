const queries = require('./queries')

module.exports = app => {
    const { existsOrError, notExistsOrError } = app.api.validation

    const save = async (req, res) => {
        //const category = { ...req.body }
        const category = {
            id: req.body.id,
            name: req.body.name,
            parentId: req.body.parentId
        }

        //if(req.params.id)
        //    category.id = req.params.id

        req.params.id && (category.id = req.params.id)

        try {
            existsOrError(category.name, "Name not provided.")
        } catch (msg) {
            return res.status(400).send(msg)
        }       
        
        if(category.id){
            const categories = await app.db.raw(queries.categoryWithChildren, category.id)
            const ids = categories.rows.map(c => c.id)
            
            if(ids.includes(category.parentId)){
                return res.status(400).send("Cannot move to a subcategory.")
            }            
        }        

        if (category.id) {
            app.db('categories')
                .update(category)
                .where({ id: category.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            app.db('categories')
                .insert(category)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }

    const remove = async (req, res) => {
        try {
            existsOrError(req.params.id, 'Category code not provided.')

            const subcategory = await app.db('categories')
                .where({ parentId: req.params.id })
            notExistsOrError(subcategory, 'This category has subcategories.')

            const articles = await app.db('articles')
                .where({ categorieId: req.params.id })
            notExistsOrError(articles, 'This category has articles.')

            const rowsDeleted = await app.db('categories')
                .where({ id: req.params.id })
                .del()
            existsOrError(rowsDeleted, 'Category not found.')

            res.status(204).send()
        } catch (msg) {
            res.status(400).send(msg)
        }
    }

    const withPath = categories => {
        const getParent = (categories, parentId) => {
            const parent = categories.filter(parent => parent.id === parentId)
            return parent.length ? parent[0] : null
        }

        const categoriesWithPath = categories.map(category => {
            let path = category.name
            let parent = getParent(categories, category.parentId)

            while (parent) {
                path = `${parent.name} > ${path}`
                parent = getParent(categories, parent.parentId)
            }

            return { ...category, path }
        })

        categoriesWithPath.sort((a, b) => {
            if (a.path < b.path) return -1
            if (a.path > b.path) return 1
            return 0
        })

        return categoriesWithPath
    }

    const limit = 10;

    const get = async (req, res) => {
        const page = req.query.page || 1
        const result = await app.db('categories').count('id').first()
        const count = parseInt(result.count)

        app.db('categories')
            .limit(limit)
            .offset(page * limit - limit)
            .then(categories => res.json({
                data: withPath(categories),
                count,
                limit
            }))
            .catch(err => res.status(500).send(err))
    }

    const getById = (req, res) => {
        app.db('categories')
            .where({ id: req.params.id })
            .first()
            .then(category => res.json(category))
            .catch(err => res.status(500).send(err))
    }

    const toTree = (categories, tree) => {
        if(!tree) 
            tree = categories.filter(category => !category.parentId)

        tree = tree.map(parentNode => {
            const isChild = node => node.parentId == parentNode.id
            parentNode.children = toTree(categories, categories.filter(isChild))
            return parentNode
        })

        return tree
    }

    const getTree = (req, res) => {
        app.db('categories')
            .then(categories => res.json(toTree(withPath(categories))))
            .catch(err => res.status(500).send(err))
    }

    return {
        save,
        remove,
        get,
        getById,
        getTree
    }
}