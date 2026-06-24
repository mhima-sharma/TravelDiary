// Allow CSS side-effect imports (e.g. import "./globals.css")
declare module "*.css" {
  const styles: { readonly [key: string]: string };
  export default styles;
}
