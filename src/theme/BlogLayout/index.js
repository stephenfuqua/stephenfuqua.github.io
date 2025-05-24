import clsx from "clsx";
import Layout from "@theme/Layout";
import BlogSidebar from "@theme/BlogSidebar";

export default function BlogLayoutWrapper(props) {
    const { sidebar, toc, children, ...layoutProps } = props;
    const hasSidebar = sidebar && sidebar.items.length > 0;

    return (
        <>
            <Layout {...layoutProps}>
                <div className="container margin-vert--lg">
                    <div className="row">
                        <BlogSidebar sidebar={sidebar} />
                        <main
                            className={clsx("col", {
                                "col--7": hasSidebar,
                                "col--9 col--offset-1": !hasSidebar,
                            })}
                        >
                            {children}
                        </main>
                        <div className="col col--2">
                            <img
                                src="/img/BHCU-logo-safnet-small-darktheme.webp"
                                alt="safnet logo"
                            />
                            {toc}
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
}
