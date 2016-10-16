# Page Change Tracker


## Synopsis

This package compares two different webpages and notifies via email/sms for any differences detected between runs. 

## Installation

For now the package requires Heroku toolbelt kit to import the environment variables. 
If needed you can set the environment variables specified in .env and use node directly. 

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

After deploying to Heroku, please activate/set api key for SendGrid. 

Note: For the time being this only supports a single page check. Open for suggestions and improvements.

## Contributors

Contributors are welcome.

## Dependencies

- blink-diff: For image comparison
- webshot/phantomjs: For screen capture. 
- cloudinary: For image storage
- sendgrid: For email notifications
- easysms: For quick sms messages.

## License

MIT License Copyright (C) 2016 by Daniel Ramirez (hello@danielrmz.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.