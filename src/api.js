const endpoint = 'https://sf-api.aaronjford.com/v1/graphql';

async function call(query, name, variables) {
    const result = await fetch(
        endpoint, {
            method: "POST",
            body: JSON.stringify({
                query: query,
                variables: variables,
                operationName: name
            }),
            headers: {'X-Hasura-Role': 'public'}
        }
    );

    return await result.json();
}

async function searchTranscripts(search) {
    const q = `
        query SearchTranscriptsQuery($search: String) {
            search_transcripts(args: {search: $search}, order_by: {meeting: {time: desc}, line_num: asc}) {
                id
                text
                speaker_title
                speaker_name
                text
                start_time
                meeting {
                    committee
                    time
                    transcript_url
                }
            }
        }
    `

    return (await call(q, 'SearchTranscriptsQuery', {search})).data.search_transcripts;
}

export { searchTranscripts }