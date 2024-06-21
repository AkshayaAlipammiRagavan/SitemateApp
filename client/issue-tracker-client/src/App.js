import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
    id: yup
        .number()
        .typeError('ID must be a number and its required')
        .required('ID is required')
        .min(1000, 'ID must be a 4-digit number')
        .max(9999, 'ID must be a 4-digit number'),
    title: yup.string().required('Title is required'),
    description: yup.string().required('Description is required')
});

function App() {
    const { register, handleSubmit, reset, formState: { errors, isDirty, isSubmitting, isValid }, setError, validate } = useForm({
      mode: "all",
      resolver: yupResolver(schema)
    });
    const [issues, setIssues] = useState([]);
    const [selectedIssue, setSelectedIssue] = useState(null);

    useEffect(() => {
        fetch('http://localhost:4000/issues')
            .then(response => response.json())
            .then(data => setIssues(data))
            .catch(error => console.error(error));
    }, []);

    const onSubmit = data => {
        if (selectedIssue) {
            handleUpdate(selectedIssue.id, data);
        } else {
            handleCreate(data);
        }
    };

    const handleCreate = (data) => {
        fetch('http://localhost:4000/issues', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(newIssue => {
            setIssues([...issues, newIssue]);
            reset();
        })
        .catch(error => {
            if (error.message === 'ID already exists') {
                setError('id', { type: 'manual', message: 'ID already exists' });
            } else {
                console.error(error);
            }
        });
    };

    const handleUpdate = (id, data) => {
        fetch(`http://localhost:4000/issues/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(updatedIssue => {
            setIssues(issues.map(issue => (issue.id === id ? updatedIssue : issue)));
            setSelectedIssue(null);
            reset();
        })
        .catch(error => console.error(error));
    };

    const handleDelete = (id) => {
        fetch(`http://localhost:4000/issues/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            setIssues(issues.filter(issue => issue.id !== id));
        })
        .catch(error => console.error(error));
    };

    const handleEdit = (issue) => {
        setSelectedIssue(issue);
        reset(issue);
    };

    return (
        <div className="App container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Issue Tracker</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
                <div className="mb-2">
                    <label htmlFor="id" className="block text-gray-700">ID</label>
                    <input
                        id="id"
                        type='number'
                        {...register('id', { validate: () => validate('id') })}
                        className="w-full px-2 py-1 border rounded"
                        disabled={!!selectedIssue}
                        data-testid="issue-id-input"
                    />
                    {errors.id && <p className="text-red-500" data-testid="issue-id-error">{errors.id.message}</p>}
                </div>
                <div className="mb-2">
                    <label htmlFor="title" className="block text-gray-700">Title</label>
                    <input
                        id="title"
                        {...register('title', { validate: () => validate('title') })}
                        className="w-full px-2 py-1 border rounded"
                        data-testid="issue-title-input"
                    />
                    {errors.title && <p className="text-red-500" data-testid="issue-title-error">{errors.title.message}</p>}
                </div>
                <div className="mb-2">
                    <label htmlFor="description" className="block text-gray-700">Description</label>
                    <input
                        id="description"
                        {...register('description', { validate: () => validate('description') })}
                        className="w-full px-2 py-1 border rounded"
                        data-testid="issue-description-input"
                    />
                    {errors.description && <p className="text-red-500" data-testid="issue-description-error">{errors.description.message}</p>}
                </div>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded"
                    disabled={!isDirty || !isValid || isSubmitting}
                    data-testid="submit-button">
                    {selectedIssue ? 'Update' : 'Create'}
                </button>
                {selectedIssue && (
                    <button
                        type="button"
                        onClick={() => { setSelectedIssue(null); reset(); }}
                        className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
                        data-testid="cancel-button"
                    >
                        Cancel
                    </button>
                )}
            </form>
            <h2 className="text-xl font-bold mb-2">Issues</h2>
            <ul>
                {issues.map(issue => (
                    <li key={issue.id} className="mb-2 p-2 border rounded">
                        <p className="font-bold">{issue.id} - {issue.title}</p>
                        <p>{issue.description}</p>
                        <button
                            onClick={() => handleEdit(issue)}
                            className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                            data-testid={`edit-button-${issue.id}`}
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDelete(issue.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded"
                            data-testid={`delete-button-${issue.id}`}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
