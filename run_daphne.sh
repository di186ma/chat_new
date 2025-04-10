#!/bin/bash
export DJANGO_SETTINGS_MODULE=chat.settings
daphne -b 0.0.0.0 -p 8000 chat.asgi:application 