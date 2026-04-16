const adminPage = ( req, res) => {
    res.status(200).json({
        status: "success",
        message: `Welcome to admin page.`
    })
}

module.exports = adminPage;