import React from 'react';
import ReactDOM from 'react-dom/client';  // Импортируйте из 'react-dom/client'
import { App } from './App';
import "antd/dist/antd";

const root = ReactDOM.createRoot(document.getElementById('root')); // Создаем root элемент
root.render(<App />); // Используем метод render через createRoot
