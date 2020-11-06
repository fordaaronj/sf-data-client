async function api(endpoint, queryParams) {
    const url = new URL('http://localhost:3000/api' + endpoint)
    if (queryParams) Object.keys(queryParams).forEach(k => url.searchParams.append(k, queryParams[k]));
    const result = await fetch(url);
    return await result.json()
}

async function searchTranscripts(search, limit = 20, offset = 0) {
    return await api('/transcripts', {q: search, limit, offset});
}

async function searchTranscriptsAggSpeakers(search) { 
    return await api('/transcripts/agg/speakers', {q: search});
}

async function searchTranscriptsAggYears(search) { 
    return await api('/transcripts/agg/years', {q: search});
}

async function searchLegislation(search) {
    return await api('/legislation', {q: search});
}

export { searchTranscripts, searchTranscriptsAggSpeakers, searchTranscriptsAggYears, searchLegislation }