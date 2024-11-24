const jwt = require('jsonwebtoken');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJzdXBlcmFkbWluIiwicm9sZSI6InN1cGVyX2FkbWluIiwiaWF0IjoxNzMyNDA0MjcwLCJleHAiOjE3MzI0OTA2NzB9.BGR-1FksSvrqFpdeOvL4FUBJEF5H0wXsEg5KFslMhDo';

try {
    const decoded = jwt.decode(token);
    console.log('Decoded token:', decoded);
} catch (error) {
    console.error('Error decoding token:', error);
}
