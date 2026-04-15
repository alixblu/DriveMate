FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential git curl \
    && rm -rf /var/lib/apt/lists/*

COPY timesfm_service/requirements.txt ./requirements.txt

# Install torch CPU wheel first (avoids pulling CUDA variant)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install remaining service dependencies
RUN pip install --no-cache-dir -r requirements.txt

COPY timesfm_service/ ./timesfm_service/

ENV PYTHONUNBUFFERED=1
ENV TIMESFM_ENABLE_LIVE_FUEL=1

# HuggingFace model cache inside container — mount a volume to persist
ENV HF_HOME=/app/timesfm_service/.hf-home
ENV TRANSFORMERS_CACHE=/app/timesfm_service/.hf-cache

EXPOSE 8008
CMD ["uvicorn", "timesfm_service.app:app", "--host", "0.0.0.0", "--port", "8008"]
