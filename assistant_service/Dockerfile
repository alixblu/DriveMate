FROM python:3.12-slim

WORKDIR /app

COPY assistant_service/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY assistant_service/ ./assistant_service/

ENV PYTHONUNBUFFERED=1

EXPOSE 8009
CMD ["uvicorn", "assistant_service.app:app", "--host", "0.0.0.0", "--port", "8009"]
