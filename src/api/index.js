import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    timeout: 30000
})

// 添加请求拦截器（调试用）
api.interceptors.request.use(config => {
    console.log('发送请求:', config.method.toUpperCase(), config.url)
    return config
})

api.interceptors.response.use(
    response => {
        console.log('收到响应:', response.status, response.data)
        return response
    },
    error => {
        console.error('请求失败:', error.message)
        return Promise.reject(error)
    }
)

// ==================== 管理员登录 ====================
export const adminLogin = (data) => api.post('/admin/login', data)

// ==================== 学生登录 ====================
export const studentLogin = (data) => api.post('/student/login', data)

// ==================== 学生个人信息 ====================
export const getStudentInfo = (sno) => api.get(`/student/info/${sno}`)
export const changePassword = (sno, data) => api.put(`/student/password/${sno}`, data)

// ==================== 图书相关 ====================
export const searchBooks = (keyword, type) => api.get('/books/search', { params: { keyword, type } })
export const getBookCopies = (isbn) => api.get(`/books/${isbn}/copies`)
export const getAllBooks = () => api.get('/books/all')
export const updateBook = (isbn, book) => api.put(`/books/${isbn}`, book)

// ==================== 借书还书 ====================
export const borrowBooks = (sno, barCodes) => api.post(`/borrow?sno=${sno}`, barCodes)
export const returnBook = (barCode) => api.post(`/borrow/return/${barCode}`)

// ==================== 借书证管理 ====================
export const createCard = (sno) => api.post(`/cards/create/${sno}`)
export const loseCard = (sno) => api.put(`/cards/lose/${sno}`)
export const reissueCard = (sno) => api.put(`/cards/reissue/${sno}`)
export const cancelCard = (sno) => api.put(`/cards/cancel/${sno}`)

// ==================== 采编管理 ====================
export const addBook = (book) => api.post('/books', book)
export const addBookCopy = (copy) => api.post('/books/copies', copy)
export const scrapCopy = (barCode) => api.put(`/books/copies/${barCode}/scrap`)
export const takeDownBook = (isbn) => api.put(`/books/${isbn}/takedown`)

// ==================== 罚款管理 ====================
export const getFines = (sno) => api.get(`/fines/${sno}`)
export const payAllFines = (sno) => api.post(`/fines/pay/${sno}`)
export const paySingleFine = (fineId) => api.post(`/fines/pay/${fineId}/single`)
export const generateFines = (sno) => api.post(`/fines/generate/${sno}`)

// ==================== 统计查询 ====================
export const getStudentRanking = () => api.get('/statistics/students/ranking')
export const getBookRanking = () => api.get('/statistics/books/ranking')
export const getPersonalInfo = (sno) => api.get(`/statistics/personal/${sno}`)

// ==================== 首页统计 ====================
export const getDashboardStats = () => api.get('/statistics/dashboard')

export default api