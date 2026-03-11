# Installing spaCy Model

## Step 1: Activate Virtual Environment

**Windows:**
```powershell
cd ai-engine
.\venv\Scripts\activate
```

**Mac/Linux:**
```bash
cd ai-engine
source venv/bin/activate
```

## Step 2: Install spaCy Model

```bash
python -m spacy download en_core_web_sm
```

## Step 3: Verify Installation

```bash
python -c "import spacy; nlp = spacy.load('en_core_web_sm'); print('✅ Model loaded successfully')"
```

## Alternative: Install via pip

If the download command doesn't work, try:

```bash
pip install https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.7.1/en_core_web_sm-3.7.1-py3-none-any.whl
```

## Note

The code will work without the spaCy model (using pattern matching fallback), but NLP-based extraction is more accurate. Install the model for best results.
