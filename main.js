document,addEventListener('DOMContentLoaded', function () {
    const submitBook = document.getElementById('inputBook');
    submitBook.addEventListener('submit', function () {
        event.preventDefault();
        addBook();
        submitBook.reset();
    });

    if (isStorageExist) {
        loadDataFromStorage();
    }
});

const books = [];

// MENAMBAHKAN DATA BUKU

function addBook() {
    const bookTitle = document.getElementById('inputBookTitle').value;
    const bookAuthor = document.getElementById('inputBookAuthor').value;
    const bookYear = document.getElementById('inputBookYear').value;
    const isComplete = document.getElementById('inputBookIsComplete').checked;
    
    const generateID = generateId();
    const bookData = generateBookData(generateID, bookTitle, bookAuthor, bookYear, isComplete);
    books.push(bookData);

    document.dispatchEvent(new Event(RENDER_EVENT));
    console.log(`${bookData.title} has been added`)
    saveData();
    succeed('Buku telah disimpan!');
}

function generateId() {
    return +new Date();
}

function generateBookData(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

const RENDER_EVENT = 'render-event';
document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookList = document.getElementById('incompleteBookList');
    incompleteBookList.innerHTML = '';

    const completeBookList = document.getElementById('completeBookList');
    completeBookList.innerHTML = '';

    for (const book of books) {
        bookObject = putBook(book)
        if (!book.isComplete) {
            incompleteBookList.append(bookObject);
        } else {
            completeBookList.append(bookObject);
        }
    }
});

function putBook(book) {
    const textTitle = document.createElement('h3');
    textTitle.classList.add('book-title')
    textTitle.innerText = book.title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = `Penulis: ${book.author}`;

    const textYear = document.createElement('p');
    textYear.innerText = `Tahun: ${book.year}`;

    const actionContainer = document.createElement('div');
    actionContainer.classList.add('action');

    const markContainer = document.createElement('div');
    markContainer.classList.add('mark-action');

    if (book.isComplete) {
        const incompleteButton = document.createElement('button');
        incompleteButton.classList.add('incomplete-button');
        incompleteButton.innerText = 'Belum selesai'
        incompleteButton.addEventListener('click', function () {
            markBookAsIncomplete(book.id);
        });
        markContainer.append(incompleteButton);
    } else {
        const completeButton = document.createElement('button');
        completeButton.classList.add('complete-button');
        completeButton.innerText = 'Sudah selesai'
        completeButton.addEventListener('click', function () {
            markBookAsComplete(book.id);
        });
        markContainer.append(completeButton);
    }
    
    const editContainer = document.createElement('div');
    editContainer.classList.add('edit-action');
    
    const editButton = document.createElement('button');
    editButton.classList.add('edit-button');
    editButton.innerText = 'Edit';
    editButton.addEventListener('click', function () {
        editBook(book.id);
    });
    editContainer.append(editButton);
    
    const removeButton = document.createElement('button');
    removeButton.classList.add('remove-button');
    removeButton.innerText = 'Hapus';
    removeButton.addEventListener('click', function () {
        confirmRemoveBook(book.id);
    });
    editContainer.append(removeButton);

    actionContainer.append(markContainer, editContainer)

    const bookContainer = document.createElement('div');
    bookContainer.classList.add('container');
    bookContainer.append(textTitle, textAuthor, textYear, actionContainer);
    bookContainer.setAttribute('id', `book-${book.id}`)

    return bookContainer;
}

// MEMINDAHKAN BUKU KE RAK 'SELESAI DIBACA'

function markBookAsComplete(bookId) {
    const bookTarget = findBook(bookId);

    if (bookId === null) return;
    bookTarget.isComplete = true;

    document.dispatchEvent(new Event(RENDER_EVENT));
    console.log(`${bookTarget.title} has been moved to complete bookshelf`);
    saveData();
}

// MEMINDAHKAN BUKU KE RAK 'BELUM SELESAI DIBACA'

function markBookAsIncomplete(bookId) {
    const bookTarget = findBook(bookId);

    if (bookId === null) return;
    bookTarget.isComplete = false;

    document.dispatchEvent(new Event(RENDER_EVENT));
    console.log(`${bookTarget.title} has been moved to incomplete bookshelf`);
    saveData();
}

function findBook(bookId) {
    for (const book of books) {
        if (book.id === bookId) {
            return book;
        }
    }
    return null;
}

// MENGEDIT DATA BUKU

function editBook(bookId) {
    const bookOld = findBook(bookId);

    const editTitle = document.getElementById('inputBookTitle');
    editTitle.value = bookOld.title;
    
    const editAuthor = document.getElementById('inputBookAuthor');
    editAuthor.value = bookOld.author;
    
    const editYear = document.getElementById('inputBookYear');
    editYear.value = bookOld.year;

    const editIsComplete = document.getElementById('inputBookIsComplete');
    if (bookOld.isComplete === true) {
        editIsComplete.checked = true;
    }

    removeBook(bookId);

    document.documentElement.scrollTop = 0;
}

// CUSTOM DIALOG: MENGHAPUS BUKU

function confirmRemoveBook(bookId) {
    const areYouSure = 'Apakah Anda yakin ingin menghapus buku ini?';
    if (confirm(areYouSure) === true) {
        removeBook(bookId);
        succeed('Buku telah dihapus!');
    }
}

// MENGHAPUS DATA BUKU

function removeBook(bookId) {
    const bookTarget = findBookIndex(bookId);
    if (bookTarget === -1) return;
    books.splice(bookTarget, 1);

    document.dispatchEvent(new Event(RENDER_EVENT));
    console.log('A book has been removed')
    saveData();
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

// MENYIMPAN DATA BUKU PADA LOCAL STORAGE

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function saveData() {
    if (isStorageExist) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);

        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function isStorageExist() {
    if (typeof(Storage) === 'undefined') {
        alert('Browser anda tidak mendukung local storage');
        return false;
    }
    return true;
}

document.addEventListener(SAVED_EVENT, function () {
    console.log('Bookshelf has been updated:')
    console.log(localStorage.getItem(STORAGE_KEY));
})

function loadDataFromStorage() {
    const loadData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(loadData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

// FITUR PENCARIAN BUKU

const searchInput = document.getElementById('searchBookTitle');
searchInput.addEventListener('keypress', function (keyboardButton) {
    if (keyboardButton.key === 'Enter') {
        searchButton.click();
    }
});

const searchButton = document.getElementById('searchButton');
searchButton.addEventListener('click', function () {
    searchBook();
});

function searchBook() {
    const inputSearch = document.getElementById('searchBookTitle').value.toLowerCase();
    const searchBooks = document.querySelectorAll('.book-title');

    for (const book of searchBooks) {
        if (book.innerText.toLowerCase().includes(inputSearch)) {
            book.parentElement.style.display = 'block';
        } else {
            book.parentElement.style.display = 'none';
        }
    }
}

// CUSTOM DIALOG: PROSES PERHASIL

function succeed(process) {
    alert(process);
}