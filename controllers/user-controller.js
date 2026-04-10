const User = require('../models/user-model')

const getAllUsers = async (req, res) => {
    try {
        const allUsers = await User.find() // Empty () is used for getting All the data
        
        res.status(200).json({
            success: true,
            data: allUsers
        });
    } catch (error) {
        console.log("Error fetching all the users -> ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

const getSingleUser = async (req, res) => {
    try {
        const userId = req.params.id
        const singleUser = await User.findById(userId)

        if (!singleUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        } else {
            res.status(200).json({
                success: true,
                data: singleUser
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

const createNewUser = async (req, res) => {
    try {
        const userData = req.body

        if (!userData.name || !userData.age) {
            return res.status(400).json({
                message: "Name and age are required"
            });
        }

        const user = await User.create(userData)

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user
        });

    } catch (error) {
        console.log("Error creating user -> ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.name = req.body.name;
        user.age = req.body.age

        await user.save()

        res.status(200).json({
            success: true,
            message: `User with ID ${req.params.id} updated successfully.`,
            data: user
        })
    } catch (error) {
        console.log("Error updating the specified user -> ", error)
        res.status(500).json({ message: "Internal server error" });
    }
}

const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            message: `User with id ${req.params.id} deleted successfully`
        });
    } catch (error) {
        console.log("Error deleting the specified user -> ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getAllActiveUsers = async (req, res) => {
    try {
        const activeUsers = await User.find({ isActive: true })

        if (activeUsers.length > 0) {
            res.status(200).json({
                success: true,
                data: activeUsers
            })
        } else {
            res.status(404).json({
                success: false,
                message: "No active user found."
            })
        }
    } catch (error) {
        console.log("Error fetching specified user -> ", error)
    }
}


module.exports = { getAllUsers, getSingleUser, createNewUser, updateUser, deleteUser, getAllActiveUsers }