const express = require('express')
const { getAllUsers, getSingleUser, createNewUser, updateUser, deleteUser, getAllActiveUsers } = require('../controllers/user-controller')

const router = express.Router()

router.get('/get-all-users', getAllUsers)
router.get('/get-single-user/:id', getSingleUser)
router.post('/create-new-user', createNewUser)
router.put('/update-user/:id', updateUser)
router.delete('/delete-user/:id', deleteUser)
router.get('/get-all-active-users', getAllActiveUsers)

module.exports = router