const express = require('express');
const cors = require('cors');
const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

let issues = [
    { id: 1001, title: 'Issue 1', description: 'Description for issue 1' },
    { id: 1002, title: 'Issue 2', description: 'Description for issue 2' },
];

// Create
app.post('/issues', (req, res) => {
    const { id, title, description } = req.body;

    // Validate all fields are present
    if (!id || !title || !description) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate ID is a 4-digit number
    if (!/^\d{4}$/.test(id)) {
        return res.status(400).json({ message: 'ID must be a 4-digit number' });
    }

    // Check if the ID already exists
    if (issues.some(issue => issue.id === id)) {
        return res.status(400).json({ message: 'ID already exists' });
    }

    const newIssue = { id, title, description };
    issues.push(newIssue);
    console.log('Created:', newIssue);
    res.status(201).json(newIssue);
});

// Read
app.get('/issues', (req, res) => {
    res.json(issues);
});

// Update
app.put('/issues/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { title, description } = req.body;

    // Validate all fields are present
    if (!title || !description) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    let updatedIssue;
    issues = issues.map(issue => {
        if (issue.id === id) {
            updatedIssue = { id, title, description };
            return updatedIssue;
        }
        return issue;
    });

    if (updatedIssue) {
        console.log('Updated:', updatedIssue);
        res.json(updatedIssue);
    } else {
        res.status(404).json({ message: 'Issue not found' });
    }
});

// Delete
app.delete('/issues/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const initialLength = issues.length;
    issues = issues.filter(issue => issue.id !== id);

    if (issues.length < initialLength) {
        console.log('Deleted:', id);
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Issue not found' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
