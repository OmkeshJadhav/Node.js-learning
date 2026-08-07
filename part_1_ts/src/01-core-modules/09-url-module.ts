

const runUrlDemo = (): void => {
    const apiUrl = new URL(
        "https://omkeshjadhav.com/users?page=2&limit=10&sort=latest"
    )
    
    /* href - Gives complete URL path */
    console.log("Complete URL: ", apiUrl.href)
    
    /* protocol - Gives http protocol */
    console.log("Protocol: ", apiUrl.protocol)  // https:

    /* origin - Gives protocol + domain */
    console.log("Protocol + Domain = ", apiUrl.origin)
    
    /* hostname - Returns the domain name */
    console.log("Hostname: ", apiUrl.hostname)  // omkeshjadhav.com
    
    /* pathnam - Returns the path after the domain and before the query string */
    console.log("Pathname: ", apiUrl.pathname)  // users
    
    /* search - Gives all the query params */
    console.log("All Query params: ", apiUrl.search)  // ?page=2&limit=10&sort=latest

    /* searchParams.get - To get the values of specified query param. It returns string | null */
    const page = apiUrl.searchParams.get('page')
    const limit = apiUrl.searchParams.get('limit')
    const sort = apiUrl.searchParams.get('sort')
    console.log("page: ", page)
    console.log("limit: ", limit)
    console.log("sort: ", sort)

    /* searchParams.set - To set the values of specified query param by replacing the existing value */
    apiUrl.searchParams.set('page', '10')
    apiUrl.searchParams.set('limit', '20')
    apiUrl.searchParams.set('sort', 'oldest')

    console.log("Url with updated query params: ", apiUrl.href)

    /* searchParams.append - appends a new query param to existing query params. */
    apiUrl.searchParams.append("filter", "active");

    console.log("Appended URL: ", apiUrl.href)

    /* searchParams.delete - delete the specified query param */
    apiUrl.searchParams.delete('filter')
    console.log('URL after deleting filter param: ', apiUrl.href)

    /* get() gives you a copy of the value. set(), append(), and delete() modify the URL object itself. 
        - get() reads a value. It does not modify the URL.
        - set() updates an existing parameter (or creates it if it doesn't exist).
        - append() adds another value for the same parameter.
        - delete() removes a parameter.
    */

    /* URLSearchParams - To Create new query which can be appended to existing url by converting it to string */
    const newQueryParams = new URLSearchParams({
        search: "node js",
        page: "10",
        limit: "5"
    })

    console.log("New Query Params: ",newQueryParams.toString())

}

runUrlDemo()