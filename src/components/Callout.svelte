<script>
    export let callout;
</script>

{#if callout}
    <div class="callout">
        <div class="text">{callout}</div>
        <div class="arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.218 19l-1.782-1.75 5.25-5.25-5.25-5.25 1.782-1.75 6.968 7-6.968 7z"/></svg>
        </div>
    </div>
{/if}

<style>
    .callout {
        display: flex;
        align-items: center;
        color: gray;
        border: 1px solid gray;
        border-radius: 5px;
        padding: 5px;
        margin-bottom: 10px;
    }

    .callout .text {
        padding: 5px;
    }

    @media (max-width: 550px) {
        .callout {
            flex-direction: column;
        }

        .callout .arrow {
            transform: rotate(0.25turn);
        }
    }

</style>