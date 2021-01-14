# ntop-widgets

## How to run ntop-widgets in ntopng

To run and test the ntop widgets components in `ntopng` you have to follow these steps:

1. Clone this repository in the same directory where `ntopng` is installed
2. Go to the `ntop-widgets` directory, open your terminal and type: `npm install && npm run build`
3. Once the build is over, go to the `ntopng` folder, open your terminal and type:

    ```bash
    cd httpdocs/js
    ln -s  ../../../ntop-widgets/dist/ntop-widgets ntop-widgets
    cd scripts/lua
    ln -s ../../tests/lua tests
    ```

4. Start `ntopng` and go to the page: `http://localhost:3000/lua/tests/test_gui_widgets.lua`.
