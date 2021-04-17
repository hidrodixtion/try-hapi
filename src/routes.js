const bookApi = require('./api/book')

const routes = [
    {
        method: 'POST',
        path: '/books',
        handler: bookApi.addBookHandler
    },
    {
        method: 'GET',
        path: '/books',
        handler: bookApi.getBookHandler
    },
    {
        method: 'GET',
        path: '/books/{id}',
        handler: bookApi.getSingleBookHandler
    },
    {
        method: 'PUT',
        path: '/books/{id}',
        handler: bookApi.updateBook
    },
    {
        method: 'DELETE',
        path: '/books/{id}',
        handler: bookApi.deleteBook
    },
]

module.exports = routes