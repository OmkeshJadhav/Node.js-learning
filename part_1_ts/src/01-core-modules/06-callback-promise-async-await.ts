type User = {
    id: number,
    name: string,
    role: "user" | 'super-admin',
}

const users: User[] = [
    {
        id: 1,
        name: "Omkesh",
        role: "super-admin"
    },
    {
        id: 2,
        name: "Dipti",
        role: "user"
    },
    {
        id: 3,
        name: "Suresh",
        role: "user"
    }
]


// Callback - It is a function that is passed to another function as a parameter
// e.g. callback(result, error)

const findUserWithCallback = (
    userId: number,
    callback: (error: Error | null, user?: User) => void
): void => {
    setTimeout(() => {
        // Actual API call
        const user = users.find(currentUser => currentUser.id == userId)

        if (!user) {
            console.log(`User with userId ${userId} does not exists.`)
            return
        }

        callback(null, user)
    }, 500)
}

findUserWithCallback(2, (error, user) => {
    if (error) {
        console.log('Callback error', error)
        return;
    }

    console.log('Callback result: ', user?.id, user?.name, user?.role)
    return;
})

// Promise


// async-await