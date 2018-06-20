#!/bin/bash
celery -A app.celery worker --loglevel=info --concurrency=1