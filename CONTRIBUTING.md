# Contributing to WiFi Access Point Registry

Thank you for your interest in contributing to the WiFi Access Point Registry! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

1. **Check existing issues** first to avoid duplicates
2. **Use the issue template** when creating new issues
3. **Provide detailed information** including:
   - Steps to reproduce the problem
   - Expected vs actual behavior
   - Environment details (OS, browser, Docker version)
   - Screenshots or logs if applicable

### Suggesting Features

1. **Open a feature request** issue
2. **Describe the use case** and why it would be valuable
3. **Provide mockups or examples** if applicable
4. **Consider the scope** - keep features focused and well-defined

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following our coding standards
4. **Test your changes** thoroughly
5. **Commit with clear messages**
6. **Push to your fork** and create a pull request

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### Local Development

1. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/wifi-access-point-registry.git
   cd wifi-access-point-registry
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Docker Development

```bash
# Quick start with Docker
./run-docker.sh

# For development with auto-rebuild
./rebuild-docker.sh
```

## 📝 Coding Standards

### JavaScript Style

- Use **ES6+ features** where appropriate
- Follow **consistent indentation** (2 spaces)
- Use **meaningful variable names**
- Add **JSDoc comments** for functions
- Keep functions **small and focused**

### Code Organization

- **Separate concerns** - keep business logic separate from presentation
- **Use consistent file structure**
- **Group related functionality** together
- **Avoid deep nesting** - prefer early returns

### Example Code Style

```javascript
/**
 * Geocodes an address using the Nominatim API
 * @param {string} address - The address to geocode
 * @returns {Promise<Object>} Geocoding result with coordinates
 */
async function geocodeAddress(address) {
  if (!address || typeof address !== 'string') {
    throw new Error('Address must be a non-empty string');
  }

  try {
    const response = await nominatimService.search(address);
    return {
      latitude: parseFloat(response.lat),
      longitude: parseFloat(response.lon),
      displayName: response.display_name
    };
  } catch (error) {
    console.error('Geocoding failed:', error);
    throw new Error('Failed to geocode address');
  }
}
```

## 🧪 Testing

### Manual Testing

1. **Test all form fields** and validation
2. **Test address search** and map interaction
3. **Test different screen sizes** (responsive design)
4. **Test error scenarios** (network failures, invalid input)
5. **Test both SQLite and PostgreSQL** configurations

### Testing Checklist

- [ ] Registration form works with valid data
- [ ] Form validation prevents invalid submissions
- [ ] Address search returns relevant results
- [ ] Map updates when address is selected
- [ ] 802.11u fields auto-populate correctly
- [ ] Access point list displays and filters work
- [ ] Pagination works with large datasets
- [ ] Application works in different browsers
- [ ] Docker deployment works correctly

## 🗄️ Database Changes

### Schema Modifications

1. **Update `database/schema.sql`** with new structure
2. **Create migration scripts** if needed
3. **Update validation** in `backend/validators/`
4. **Update API endpoints** to handle new fields
5. **Update frontend forms** and displays

### Adding New 802.11u Mappings

1. **Edit the CSV file**: `backend/data/nominatim-to-80211u-conversion-table.csv`
2. **Follow the existing format**: `osm_class,osm_type,wifi_group,wifi_type`
3. **Test the mapping** with real addresses
4. **Document the change** in your pull request

## 🎨 Frontend Guidelines

### HTML Structure

- Use **semantic HTML5** elements
- Ensure **accessibility** (ARIA labels, proper headings)
- Keep markup **clean and minimal**

### CSS Guidelines

- Use **CSS Grid and Flexbox** for layouts
- Follow **mobile-first** responsive design
- Use **CSS custom properties** for theming
- Keep styles **modular and reusable**

### JavaScript Guidelines

- Use **vanilla JavaScript** (no frameworks)
- Implement **progressive enhancement**
- Handle **errors gracefully**
- Use **async/await** for asynchronous operations

## 🔧 Backend Guidelines

### API Design

- Follow **RESTful conventions**
- Use **appropriate HTTP status codes**
- Provide **consistent error responses**
- Include **proper validation**

### Database Queries

- Use **parameterized queries** to prevent SQL injection
- Implement **proper error handling**
- Consider **performance implications**
- Support **both SQLite and PostgreSQL**

### Error Handling

```javascript
// Good error handling example
app.post('/api/access-points', async (req, res) => {
  try {
    const validatedData = await validateAccessPoint(req.body);
    const result = await createAccessPoint(validatedData);
    res.status(201).json(result);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      console.error('Unexpected error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});
```

## 📚 Documentation

### Code Documentation

- Add **JSDoc comments** for all functions
- Document **complex algorithms** or business logic
- Include **usage examples** for utility functions

### API Documentation

- Document **all endpoints** with examples
- Include **request/response schemas**
- Document **error responses**

### User Documentation

- Update **README.md** for new features
- Add **screenshots** for UI changes
- Update **QUICK_START.md** if setup changes

## 🚀 Pull Request Process

### Before Submitting

1. **Test thoroughly** on your local environment
2. **Check code style** and formatting
3. **Update documentation** if needed
4. **Rebase on latest main** to avoid conflicts

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [ ] Manual testing completed
- [ ] All existing functionality still works
- [ ] New functionality works as expected

## Screenshots
(If applicable)

## Additional Notes
Any additional context or considerations
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** in review environment
4. **Approval** and merge

## 🏷️ Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality
- **PATCH** version for backwards-compatible bug fixes

## 📞 Getting Help

- **Open an issue** for questions about contributing
- **Check existing documentation** first
- **Be specific** about what you need help with

## 🎉 Recognition

Contributors will be recognized in:
- **CHANGELOG.md** for significant contributions
- **README.md** contributors section
- **Release notes** for major features

Thank you for contributing to the WiFi Access Point Registry! 🚀
