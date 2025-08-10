import sys
import json
import torch
import numpy as np
from transformers import AutoTokenizer, AutoModelForSequenceClassification

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
N_FOLDS = 5

def load_models(role):
    """Load models based on role"""
    models = []
    tokenizers = []
    model_base_path = f"{role}_model"  # e.g., full_stack_model, data_analyst_model

    for fold in range(N_FOLDS):
        model_path = f"models/{model_base_path}s/{model_base_path}_fold{fold}"
        try:
            tokenizer = AutoTokenizer.from_pretrained(model_path)
            model = AutoModelForSequenceClassification.from_pretrained(model_path).to(DEVICE)
            model.eval()
            models.append(model)
            tokenizers.append(tokenizer)
        except Exception as e:
            print(f"Error loading fold {fold}: {e}", file=sys.stderr)

    return models, tokenizers

def ensemble_score(text, role):
    models, tokenizers = load_models(role)

    if not models:
        raise ValueError(f"No models found for role: {role}")
    
    all_scores = []

    for model, tokenizer in zip(models, tokenizers):
        try:
            inputs = tokenizer(
                text,
                return_tensors="pt",
                truncation=True,
                padding=True,
                max_length=512
            ).to(DEVICE)

            with torch.no_grad():
                outputs = model(**inputs)
                probs = torch.softmax(outputs.logits, dim=1)
                score = probs[0][1].item() * 100
                all_scores.append(score)
        except Exception as e:
            print(f"Prediction error: {e}", file=sys.stderr)

    if not all_scores:
        raise RuntimeError("All model predictions failed.")

    mean_score = np.mean(all_scores)
    std_dev = np.std(all_scores)
    median_score = np.median(all_scores)
    min_score = min(all_scores)
    max_score = max(all_scores)
    confidence = 100 - (std_dev / mean_score * 100) if mean_score > 0 else 0

    return {
        "ensemble_score": float(mean_score),
        "confidence": float(confidence),
        "score_range": [float(min_score), float(max_score)],
        "median_score": float(median_score),
        "std_dev": float(std_dev),
        "individual_scores": [float(s) for s in all_scores],
        "model":role
    }

if __name__ == "__main__":
    try:
        if len(sys.argv) < 3:
            raise ValueError("Text and role must be provided")

        input_text = sys.argv[1]
        role = sys.argv[2]

        if not input_text.strip():
            raise ValueError("Empty resume text")

        results = ensemble_score(input_text, role)

        output = {
            "success": True,
            **results
        }

        print(json.dumps(output))

    except Exception as e:
        error_output = {
            "success": False,
            "error": str(e),
            "type": type(e).__name__
        }
        print(json.dumps(error_output))
        sys.exit(1)
