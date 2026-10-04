### Backend configuration

If deploying the backend manually, use these settings:

- **Root directory:** `backend`
- **Build command:** `pip install -r requirements.txt`
- **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Health check path:** `/health`

### Frontend configuration

If deploying the frontend manually, use these settings:

- **Root directory:** `frontend`
- **Build command:** `npm install && npm run build`
- **Publish directory:** `dist`
- **Environment variable:** `VITE_API_URL` set to the deployed backend URL

### CORS configuration

The backend must allow requests from the deployed frontend domain. For production deployments, configure `allow_origins` in `backend/app/main.py` to include the exact frontend URL rather than allowing all origins.

## Running Tests

From the project root, run:

```bash
cd backend
python -m unittest discover -s tests -v
```

The tests cover the Myers diff algorithm implementation.

## Limitations

- Supports UTF-8 text files; binary file comparison is not supported.
- Uploaded files are limited to 1 MB each.
- Text API inputs are limited to 500,000 characters per input.
- When multiple shortest edit scripts are possible, the selected alignment may differ from other diff tools.
- Production deployments should review CORS, file handling, rate limiting, and error handling.

## Future Improvements

- Syntax highlighting for programming languages.
- Side-by-side comparison mode.
- Downloadable unified diff and patch files.
- Support for larger files and streaming comparisons.
- Improved error handling and accessibility.
- Additional algorithm benchmarks and automated tests.

## Author

**Rohit Malviya**

GitHub: [Rohitmalviya05](https://github.com/Rohitmalviya05)

## License

No license has been specified yet. All rights remain with the copyright holder unless a license is added to this repository.
