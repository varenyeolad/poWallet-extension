import React from "react";

const NFTList = ({ nfts }) => (
  <>
    {nfts.map((e, i) => e && <img key={i} className="nftImage" alt="nftImage" src={e} />)}
  </>
);

export default NFTList;
