import React, { useState } from 'react';

function IdeaGenerator() {
  // Type for a suggested idea object
  type SuggestedIdea = {
    generated_idea: string;
    [key: string]: any;
  };

  // State for the list of suggested ideas from n8n
  const [suggestedIdeas, setSuggestedIdeas] = useState<SuggestedIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [finalIdea, setFinalIdea] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Educational');
  const [selectedTone, setSelectedTone] = useState('casual');
  const [variations, setVariations] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // --- NEW: State for the reference tweets library ---
  const [referenceTweets, setReferenceTweets] = useState('');

  // This function runs when the user clicks the "Generate Tweets" button
  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setIsGenerating(true);
    setVariations(null);

    try {
      const response = await fetch('https://fahisk.app.n8n.cloud/webhook/second', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // --- MODIFIED: Add reference_tweets to the API call ---
        body: JSON.stringify({
          selected_idea: finalIdea,
          category: selectedCategory,
          tone_style: selectedTone,
          reference_tweets: referenceTweets, // This is the new data we're sending
        }),
      });
      const data = await response.json();
      setVariations(data);
    } catch (error) {
      console.error("Error generating variations:", error);
      alert("Failed to generate variations. Make sure your n8n 'Generate Variations' workflow is active.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestionClick = (ideaText: string) => {
    setFinalIdea(ideaText);
  };

  const fetchIdeas = async () => {
    setIsLoading(true);
    setSuggestedIdeas([]);
    try {
      const response = await fetch('https://fahisk.app.n8n.cloud/webhook/start', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await response.json();
      let foundIdeas: SuggestedIdea[] = [];
      if (Array.isArray(data)) {
        foundIdeas = data;
      } else if (data && Array.isArray(data.items)) {
        foundIdeas = data.items;
      } else if (data && data.generated_idea) {
        foundIdeas = [data];
      }
      setSuggestedIdeas(foundIdeas);
    } catch (error) {
      console.error("Error fetching ideas:", error);
      alert("Failed to fetch ideas. Make sure your n8n 'Get Ideas' workflow is active and CORS is configured.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyIdea = async (ideaText: string, index: number) => {
    try {
      await navigator.clipboard.writeText(ideaText);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1200);
    } catch (err) {
      alert('Failed to copy!');
    }
  };

  return (
    <div className="generator-container">
      {/* Section for Suggested Ideas (No changes here) */}
      <div className="suggestions-box">
        <h3>Suggested Ideas (copy from here)</h3>
        <button
          type="button"
          onClick={fetchIdeas}
          disabled={isLoading}
          style={{ marginBottom: "1rem" }}
        >
          {isLoading ? 'Fetching...' : 'Fetch New Ideas'}
        </button>
        <div className="ideas-list">
          {Array.isArray(suggestedIdeas) && suggestedIdeas.length > 0 ? (
            suggestedIdeas.map((idea, index) => (
              <div
                key={index}
                className="suggestion-card"
                onClick={() => handleSuggestionClick(idea.generated_idea)}
                style={{ cursor: 'pointer', position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem' }}
              >
                <span style={{ flex: 1 }}>{idea.generated_idea}</span>
                <button
                  type="button"
                  // className="copy-btn"
                  onClick={e => { e.stopPropagation(); handleCopyIdea(idea.generated_idea, index); }}
                  style={{ marginLeft: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: '1.1rem', padding: '4px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', transition: 'background 0.2s' }}
                  aria-label="Copy idea"
                  title="Copy to clipboard"
                >
                  {copiedIndex === index ? (
                    <span style={{ fontSize: '0.95rem', color: '#16a34a', fontWeight: 600 }}>✓</span>
                  ) : (
                    <span style={{ fontSize: '1.1rem' }}>📋</span>
                  )}
                </button>
              </div>
            ))
          ) : (
            !isLoading && <p style={{ color: "#aaa", textAlign: "center" }}>Click "Fetch New Ideas" to start.</p>
          )}
        </div>
      </div>

      {/* Main Form for Submission */}
      <form onSubmit={handleSubmit} className="idea-form">
        <div className="form-group">
          <label htmlFor="idea-paste-area">Your Chosen Idea:</label>
          <textarea
            id="idea-paste-area"
            value={finalIdea}
            onChange={(e) => setFinalIdea(e.target.value)}
            required
            rows={4}
            placeholder="Click an idea above, or type your own here..."
          />
        </div>

        {/* --- NEW: Textarea for Reference Tweet Library --- */}
        <div className="form-group">
          <label htmlFor="reference-tweets-area">Reference Tweet Library (Optional):</label>
          <textarea
            id="reference-tweets-area"
            value={referenceTweets}
            onChange={(e) => setReferenceTweets(e.target.value)}
            rows={6}
            placeholder="Paste  your tweets here. The AI will learn their style, voice, and structure to create better, more personalized content for you."
          />
        </div>
        {/* --- END of new section --- */}

        <div className="form-group">
          <label htmlFor="category-select">Select a Category:</label>
          <select id="category-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="Educational">Educational</option>
            <option value="BuildInPublic">BuildInPublic</option>
            <option value="SuccessStory">SuccessStory</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="tone-select">Select a Tone/Style:</label>
          <select id="tone-select" value={selectedTone} onChange={(e) => setSelectedTone(e.target.value)}>
            <option value="casual">Casual</option>
            <option value="professional">Professional</option>
            <option value="witty">Witty</option>
          </select>
        </div>

        <button type="submit" disabled={isGenerating || !finalIdea}>
          {isGenerating ? 'Generating...' : 'Generate Tweets'}
        </button>
      </form>

      {/* Section for Output */}
      {variations && (
        <div className="variations-output">
          <h3>Generated Variations:</h3>
          <div className="variation-card"><strong>Variation 1:</strong> {variations.variation1}</div>
          <div className="variation-card"><strong>Variation 2:</strong> {variations.variation2}</div>
          <div className="variation-card"><strong>Variation 3:</strong> {variations.variation3}</div>
        </div>
      )}
    </div>
  );
}

export default IdeaGenerator;