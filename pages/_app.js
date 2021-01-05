import '../styles/globals.css'
import {AppProvider} from "../contexts/AppContext";
import store from "../src/redux/store"
import {Provider} from "react-redux";
import WebIdProvider from "../contexts/WebIdProvider";

function MyApp({Component, pageProps}) {
    return (
        <Provider store={store}>
            <WebIdProvider>
                <Component {...pageProps} />
            </WebIdProvider>
        </Provider>
    )
}

export default MyApp
