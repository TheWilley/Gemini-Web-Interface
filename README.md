<h1 align="center">
  Gemini Web Interface
</h1>

<h4 align="center">A functional clone of Google's Gemini chat interface</h4>

<p align="center">
  <a href="#about">About</a> •
  <a href="#usage">Usage</a> •
  <a href="#todo">Todo</a> •
  <a href="#license">License</a>
</p>
  <img src=screenshot.png>

## About

This is a functional clone of Google's gemini chat interface. It's been made to closely resemble the UI found on the official website, altough with less _Crash Bang Kablooey_ as I've not put nearly as much effort into polish and animation. Further more, the only supported input method (currently) is text. It is however functional as a simple chatbot, which is the primary goal of this project. More than anything I made this as a learning experience, and to that end it succeeded.

If you have to pick, use Googles official website over this.

### Features

- Text intput & Output
- Picking model (2.0 Flash, 2.0 Flash Lite, 1.5 Flash)
- Multiple chats (retained between sessions with localStorage)
- Exporting and importing chats
- Interaction with the Gemini API using official SDK

## Usage

> [!CAUTION]
> Do not upload the built site to any public domain, as your API key is exposed in the compiled Javascript.

Before proceeding, rename `.env.example` to `.env` and set the `VITE_GEMINI_API_KEY` variable to your API key. You can get one on [Google's dev platform](https://ai.google.dev/gemini-api/docs/api-key).

```
# Clone this repo
git clone https://github.com/TheWilley/Gemini-Web-Interface

# CD into repo
cd Gemini-Web-Interface

# Install dependencies
$ npm i

# Start development server
$ npm run dev

# Build for production
$ npm run build

# Preview built site
$ npm run preview
```

## Todo

- [ ] Create tests
- [x] Make the API more configurable (token limits, temperature, etc.) ([f5e903c](https://github.com/TheWilley/Gemini-Web-Interface/commit/f5e903c5fb0c0d2c82d1d10cfcb590e60b19653f), [6cb7502](https://github.com/TheWilley/Gemini-Web-Interface/commit/6cb7502399e274664fbbf49e833a78eb37a30a2a), [17cf2a3](https://github.com/TheWilley/Gemini-Web-Interface/commit/17cf2a307825a3459fb24627876d5d360a322aea), [ea006fb](https://github.com/TheWilley/Gemini-Web-Interface/commit/ea006fb274d4a381f5b734e629f9bbc08d3e55fa))
- [ ] Add support for uploading files
- [ ] Add support for image rendering in chat
- [ ] Add more comments and clean up code.
- [x] Rename and delete induvidual chats ([47a7a71](https://github.com/TheWilley/Gemini-Web-Interface/commit/47a7a712e32153193cda0b7f6192146c9b717c6c))
- [ ] Polish everything

## License

[MIT](./LICENSE)
