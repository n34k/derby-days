import React from "react";

const DisclosuresPage = () => {
    return (
        <div className="flex flex-col py-3 items-center">
            <h1 className="text-4xl md:text-7xl font-bold mb-5">Disclosures and Polices</h1>
            <div
                className="bg-primary rounded-lg border border-white w-[90vw] flex flex-col p-2 gap-3
            "
            >
                <div className="flex flex-col">
                    <h2 className="font-bold text-lg">Contact Information</h2>
                    <p className="text-info-content">
                        If you have any questions regarding Derby Days, donations, or merchandise, please contact us at:{" "}
                        <a href="mailto:frenoderbydays@gmail.com">fresnoderbydays@gmail.com</a>
                    </p>
                </div>
                <div className="flex flex-col">
                    <h2 className="font-bold text-lg">Merchandise Sales</h2>
                    <p className="text-info-content">
                        Derby Days sells limited-run T-shirts in support of our philanthropic efforts. All T-shirt sales
                        are final. We do not offer refunds, returns, or exchanges. Please review product descriptions
                        and sizing information carefully before completing your purchase. All proceeds from merchandise
                        sales are donated to charity.
                    </p>
                </div>
                <div className="flex flex-col">
                    <h2 className="font-bold text-lg">Donations</h2>
                    <p className="text-info-content">
                        Donations made through the Derby Days platform are voluntary contributions and are final and
                        non-refundable, except in cases of duplicate charges or processing errors.
                    </p>
                </div>
                <div className="flex flex-col">
                    <h2 className="font-bold text-lg">Ad Book Advertising</h2>
                    <p className="text-info-content">
                        Derby Days offers paid advertising placements in its event ad book and on the donors page on the
                        website. Ad purchases support our philanthropic efforts and help fund Derby Days programming.
                        All ad book purchases are final. We do not offer refunds, cancellations, or credits once an ad
                        has been purchased. Advertisers are responsible for submitting ad content and ensuring all
                        materials meet provided specifications. Failure to submit materials on time does not qualify for
                        a refund. Derby Days reserves the right to reject any advertisement that is inappropriate,
                        unlawful, or inconsistent with the values of the event.
                    </p>
                </div>
                <div className="flex flex-col">
                    <h2 className="font-bold text-lg">Refunds and Disputes</h2>
                    <p className="text-info-content">
                        We encourage customers to contact us directly with any questions or concerns before initiating a
                        payment dispute or chargeback, so we can work to resolve the issue promptly.
                    </p>
                </div>
                <div className="flex flex-col">
                    <h2 className="font-bold text-lg">Legal Notice</h2>
                    <p className="text-info-content">
                        By purchasing merchandise or making a donation through Derby Days, you agree to these
                        Disclosures & Policies and acknowledge that all transactions are subject to applicable laws and
                        payment processor requirements.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DisclosuresPage;
