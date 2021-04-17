const { nanoid } = require('nanoid')

class NotFoundError extends Error {
    constructor (message) {
        super(message)
        Object.setPrototypeOf(this, NotFoundError.prototype)
    }
}

class BadRequestError extends Error {
    constructor (message) {
        super(message)
        Object.setPrototypeOf(this, BadRequestError.prototype)
    }
}

// Book store
const books = []

function createResponsePayload (message, data = undefined) {
    const status = data ? 'success' : 'fail'

    return {
        status: status,
        message: message,
        data: data
    }
}

function errorHandler (header, err) {
    if (err instanceof BadRequestError) {
        return header.response(createResponsePayload(err.message)).code(400)
    } else if (err instanceof NotFoundError) {
        return header.response(createResponsePayload(err.message)).code(404)
    } else {
        return header.response(createResponsePayload(err.message)).code(500)
    }
}

function saveBook (book) {
    if (book.name === undefined) {
        throw new BadRequestError('Gagal menambahkan buku. Mohon isi nama buku')
    }

    if (book.readPage > book.pageCount) {
        throw new BadRequestError('Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount')
    }

    const date = new Date()
    const id = nanoid()

    book.id = id
    book.bookId = id
    book.finished = (book.pageCount === book.readPage)
    book.insertedAt = date.toISOString()
    book.updatedAt = date.toISOString()

    books.push(book)
    return book
}

function getBooks (query) {
    let clonedBooks = JSON.parse(JSON.stringify(books))
    if (query.reading) {
        if (query.reading === '1') {
            clonedBooks = clonedBooks.filter(item => item.reading)
        } else {
            clonedBooks = clonedBooks.filter(item => !item.reading)
        }
    }

    if (query.finished) {
        if (query.finished === '1') {
            clonedBooks = clonedBooks.filter(item => item.finished)
        } else {
            clonedBooks = clonedBooks.filter(item => !item.finished)
        }
    }

    if (query.name) {
        clonedBooks = clonedBooks.filter(item => item.name.toLowerCase().includes(query.name.toLowerCase()))
    }

    return clonedBooks.map((item) => {
        return {
            id: item.id,
            name: item.name,
            publisher: item.publisher
        }
    })
}

function getSingleBook (id) {
    const filteredBook = books.filter(item => item.id === id)

    if (filteredBook.length === 0) {
        throw new NotFoundError('Buku tidak ditemukan')
    }

    return filteredBook[0]
}

function updateBook (id, book) {
    if (book.name === undefined) {
        throw new BadRequestError('Gagal memperbarui buku. Mohon isi nama buku')
    }

    if (book.readPage > book.pageCount) {
        throw new BadRequestError('Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount')
    }

    const bookIndex = books.findIndex(item => item.id === id)

    if (bookIndex < 0) {
        throw new NotFoundError('Gagal memperbarui buku. Id tidak ditemukan')
    }

    const newBookValue = Object.assign(books[bookIndex], book)
    newBookValue.updatedAt = (new Date()).toISOString()
    books[bookIndex] = newBookValue

    return newBookValue
}

function deleteBook (id) {
    const bookIndex = books.findIndex(item => item.id === id)

    if (bookIndex < 0) {
        throw new NotFoundError('Buku gagal dihapus. Id tidak ditemukan')
    }

    const removed = books.splice(bookIndex, 1)
    return removed
}

const bookApi = {
    addBookHandler: function (req, header) {
        try {
            const book = saveBook(req.payload)
            const response = createResponsePayload(
                'Buku berhasil ditambahkan', book
            )
            return header.response(response).code(201)
        } catch (err) {
            return errorHandler(header, err)
        }
    },

    getBookHandler: function (req, header) {
        const response = createResponsePayload(
            '', { books: getBooks(req.query) }
        )
        return header.response(response).code(200)
    },

    getSingleBookHandler: function (req, header) {
        const { id } = req.params

        try {
            const response = createResponsePayload(
                '', { book: getSingleBook(id) }
            )
            return header.response(response).code(200)
        } catch (err) {
            return errorHandler(header, err)
        }
    },

    updateBook: function (req, header) {
        const { id } = req.params

        try {
            const response = createResponsePayload(
                'Buku berhasil diperbarui', { book: updateBook(id, req.payload) }
            )
            return header.response(response).code(200)
        } catch (err) {
            return errorHandler(header, err)
        }
    },

    deleteBook: function (req, header) {
        const { id } = req.params

        try {
            const response = createResponsePayload(
                'Buku berhasil dihapus', { book: deleteBook(id) }
            )
            return header.response(response).code(200)
        } catch (err) {
            return errorHandler(header, err)
        }
    }
}

module.exports = bookApi
