import { loading } from './stores';

let numLoading = 0

async function api(endpoint, queryParams) {
    loading.set(true);
    numLoading += 1
    const url = new URL(process.env.API_ENDPOINT + endpoint)
    if (queryParams) Object.keys(queryParams).forEach(k => url.searchParams.append(k, queryParams[k]));
    const result = await fetch(url);
    numLoading -= 1;
    if (numLoading == 0) loading.set(false)
    return await result.json()
}

export { api }