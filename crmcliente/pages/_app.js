import { ApolloProvider } from '@apollo/client'; //haciendo disponible a apollo en todos los componentes de nuestra app
import client from '../config/apollo';

const MyApp = ({ Component, pageProps }) => {
  // console.log('desde _app.js'); //este es como el archivo principal
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
};

export default MyApp;
