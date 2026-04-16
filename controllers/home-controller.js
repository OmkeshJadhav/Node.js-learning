const homePage = ( req, res) => {
    try {
        res.status(200).json({
        status: "success",
        message: `Welcome to home page.`
    })
    } catch (error) {
        console.log(error)
    }
    
}

module.exports = homePage;