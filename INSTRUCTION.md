# Stream Project

## Setup Instructions (Windows)

### 1. Install Python

Make sure you have **Python 3.10+** installed.  
Check version:

```powershell
python --version
```

If not installed, download from: [python.org/downloads](https://www.python.org/downloads/)

---

### 2. Install pip (if missing)

Check pip:

```powershell
python -m pip --version
```

If you get an error, install pip:

```powershell
python -m ensurepip --upgrade
```

---

### 3. Create a Virtual Environment

From your project folder:

```powershell
python -m venv .venv
```

---

### 4. Activate the Environment

```powershell
.venv\Scripts\activate
```

You should now see `(.venv)` in your terminal prompt.
ex. `(.venv) `

To deactivate later:

```powershell
deactivate
```

---

### 5. Install Dependencies

Inside the virtual environment, install the libraries your project needs:

```powershell
pip install numpy scipy matplotlib
```

(If later you need more, just run `pip install <package>`)

---

### 6. Run the Project

```powershell
python main.py
```
