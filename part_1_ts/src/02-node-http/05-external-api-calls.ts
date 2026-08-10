
const API_URL = 'https://jsonplaceholder.typicode.com/users/1'

type PlaceholderUser = {
    id: number,
    name: string,
    email: string,
    address: {
        city: string
    },
    company: {
        name: string
    }
}

type PublicUser = {
    id: number,
    name: string,
    email: string,
    address: string,
    company_name: string
}

const dataTransform = (rawData: PlaceholderUser): PublicUser => {
    return {
        id: rawData.id,
        name: rawData.name,
        email: rawData.email,
        address: rawData.address.city,
        company_name: rawData.company.name
    }
}

const fetchExternalData = async (): Promise<void> => {

    const controller = new AbortController();

    const timer = setTimeout(() => {
        controller.abort()
    }, 5000)

    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            signal: controller.signal
        })

        if(!response.ok){
            console.log('Failed to fetch data.')
        }

        const rawData = (await response.json) as PlaceholderUser

        dataTransform(rawData)

    } catch (error) {
        if(error instanceof Error && error.name === "AbortError"){
            console.log(error)
        }

        const message = error instanceof Error ? error.message : "Unknown error"
        console.log(message)
    } finally {
        clearTimeout(timer)
    }
}

fetchExternalData()