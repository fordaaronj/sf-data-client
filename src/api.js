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

async function searchTranscripts(search, limit, offset) {
    const q = `
        query SearchTranscriptsQuery($search: String, $limit: Int, $offset: Int) {
            search_transcripts(args: {search: $search}, order_by: {meeting: {time: desc}, line_num: asc}, limit: $limit, offset: $offset) {
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

    return (await call(q, 'SearchTranscriptsQuery', {search, limit, offset})).data.search_transcripts;
}

async function searchTranscriptsAggSpeakers(search) { 
    const q = `
        query SearchTranscriptsAggSpeakersQuery($search: String) {
            search_transcripts_agg_speakers(args: {search: $search}, where: {category: {_is_null: false}}, order_by: {count: desc}) {
                category
                count
            }
        }
    `

    return (await call(q, 'SearchTranscriptsAggSpeakersQuery', {search})).data.search_transcripts_agg_speakers;
}

async function searchTranscriptsAggYears(search) { 
    const q = `
        query SearchTranscriptsAggYearsQuery($search: String) {
            search_transcripts_agg_years(args: {search: $search}, order_by: {category: asc}) {
                category
                count
            }
        }
    `

    return (await call(q, 'SearchTranscriptsAggYearsQuery', {search})).data.search_transcripts_agg_years;
}

async function searchLegislation(search) {
    const q = `
        query SearchLegislationQuery($search: String) {
            search_legislation(args: {search: $search}, order_by: {introduced_on: desc}, limit: 100) {
                details_url
                enactment_date
                file_num
                finalized_on
                id
                in_control
                name
                on_agenda
                status
                title
                type
                introduced_on
                legislation_sponsors {
                    person {
                        id
                        name
                    }
                }
                legislation_histories(order_by: {date: desc}) {
                    result
                    action
                    action_by
                    action_url
                    created_at
                    date
                    id
                    votes {
                        vote
                        person {
                            id
                            name
                        }
                    }
                }
            }
        }
    `
    return (await call(q, 'SearchLegislationQuery', {search})).data.search_legislation;
}

export { searchTranscripts, searchTranscriptsAggSpeakers, searchTranscriptsAggYears, searchLegislation }