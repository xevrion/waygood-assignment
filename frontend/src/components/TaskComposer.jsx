const operations = [
  { value: "uppercase", label: "Uppercase" },
  { value: "lowercase", label: "Lowercase" },
  { value: "reverse", label: "Reverse" },
  { value: "word_count", label: "Word Count" }
];

export function TaskComposer({ onSubmit, loading }) {
  return (
    <form className="panel" onSubmit={(event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      onSubmit({
        title: formData.get("title"),
        inputText: formData.get("inputText"),
        operation: formData.get("operation")
      });
      event.currentTarget.reset();
    }}>
      <h2>Create Task</h2>
      <label>
        Title
        <input name="title" placeholder="Normalize support note" required />
      </label>
      <label>
        Input text
        <textarea name="inputText" rows="5" placeholder="Paste the source text here" required />
      </label>
      <label>
        Operation
        <select name="operation" defaultValue="uppercase">
          {operations.map((operation) => (
            <option key={operation.value} value={operation.value}>
              {operation.label}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" disabled={loading}>
        {loading ? "Queueing..." : "Run Task"}
      </button>
    </form>
  );
}

