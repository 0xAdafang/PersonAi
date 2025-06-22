<script lang="ts">
    let question = ''
    let style = 'poetique'
    let character_id = '1'
    let scenario_id = '1'
    let user_id = 'demo'

    let history: { sender: 'user' | 'ai'; text: string }[] = [];

    async function sendMessage() {
        if(!question.trim()) return;

        history.push({ sender: 'user', text: question});

        const response = await fetch('http://localhost:8080/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question,
                style,
                character_id,
                scenario_id,
                user_id
            })

        });

        const data = await response.json();
        history.push({ sender: 'ai', text: data.answer });
        question = '';

    }
</script>

<h1>Story-chan Chat</h1>

<div class="controls">
	<select bind:value={style}>
		<option value="poétique">Poétique</option>
		<option value="humoristique">Humoristique</option>
		<option value="tragique">Tragique</option>
		<option value="épique">Épique</option>
	</select>
</div>

<div class="chat-box">
	{#each history as message}
		<div class={message.sender === 'user' ? 'user-msg' : 'ai-msg'}>
			<strong>{message.sender === 'user' ? '👤 Toi' : '🤖 IA'} :</strong>
			<p>{message.text}</p>
		</div>
	{/each}
</div>

<div class="input-zone">
	<input bind:value={question} on:keydown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Que veux-tu dire ?" />
	<button on:click={sendMessage}>Envoyer</button>
</div>

<style>
	.chat-box {
		padding: 1rem;
		max-height: 400px;
		overflow-y: auto;
		margin-bottom: 1rem;
		background: #1e1e1e;
		border-radius: 8px;
	}
	.user-msg, .ai-msg {
		margin-bottom: 0.75rem;
	}
	.input-zone {
		display: flex;
		gap: 0.5rem;
	}
	input {
		flex: 1;
		padding: 0.5rem;
	}
	button {
		padding: 0.5rem 1rem;
	}
</style>