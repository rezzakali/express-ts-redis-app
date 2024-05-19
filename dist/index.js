"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const ioredis_1 = __importDefault(require("ioredis"));
const morgan_1 = __importDefault(require("morgan"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
app.use((0, morgan_1.default)('dev'));
// Create a Redis client
const client = new ioredis_1.default(REDIS_URL);
// Middleware for caching
const cacheMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const key = req.originalUrl;
    try {
        const data = yield client.get(key);
        if (data) {
            res.send(JSON.parse(data));
        }
        else {
            next();
        }
    }
    catch (err) {
        console.error('Redis error:', err);
        next(err);
    }
});
// Example route
app.get('/users', cacheMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Simulate a database call
    const response = yield axios_1.default.get('https://jsonplaceholder.typicode.com/users');
    const data = response.data;
    // Cache the response
    yield client.setex(req.originalUrl, 120, JSON.stringify(data)); // cache for 1 hr
    res.json({ data });
}));
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
