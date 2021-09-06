/*

    Copyright 2021 DODO ZOO.
    SPDX-License-Identifier: Apache-2.0

*/

pragma solidity 0.6.9;
pragma experimental ABIEncoderV2;

import {InitializableOwnable} from "../../lib/InitializableOwnable.sol";
import {SafeMath} from "../../lib/SafeMath.sol";
import {IFilterERC721Model} from "../intf/IFilterERC721Model.sol";

contract FilterERC721Model is InitializableOwnable, IFilterERC721Model {
    using SafeMath for uint256;

    //=================== Storage ===================
    // nftCollection -> nftId -> price(frag)
    mapping(address => mapping(uint256 => uint256)) public _PRICES_;
    
    // nftCollection -> nftId -> specPrice(frag)
    mapping(address => mapping(uint256 => uint256)) public _SPEC_PRICES_;
    
    uint256 public _SPEC_FACTOR_ = 200;
    
    // nftColletcion -> nftIds
    mapping(address => uint256[]) public _NFT_COLLECTION_IDS_;

    address[] public _NFT_COLLECTIONS_;

    uint256 public _LOTTERY_THRESHOLD_;

    uint256 public _TOTAL_NFT_AMOUNT_;

    uint256 public _CURRENT_NFT_AMOUNT_;

    function init(
        address owner
    ) external {
        //TODO:
        initOwner(owner);
    }

    //==================== View ==================
    function isFilterERC721Pass(address nftCollectionAddress, uint256 nftId) override external view returns (bool) {
        if(_PRICES_[nftCollectionAddress][nftId] == 0) 
            return false;
        else
            return true;
    }

    function saveNFTPrice(address nftCollectionAddress, uint256 nftId) override external view returns(uint256) {
        return _PRICES_[nftCollectionAddress][nftId];
    }

    function buySpecNFTPrice(address nftCollectionAddress, uint256 nftId) override external view returns(uint256) {
        return _SPEC_PRICES_[nftCollectionAddress][nftId];
    }

    function buyLotteryNFTPrice() override external view returns(uint256) {
        return _LOTTERY_THRESHOLD_;
    }

    function lottery() override external view returns(address nftCollection, uint256 nftId) {
        //random
    }



    //TODO: nftInCap
    //TODO: nftOutCap


    //============= Owner ===============
    function setNFTFilter(
        address[] memory nftCollections, 
        uint256[] memory nftIds, 
        uint256[] memory prices, 
        uint256[] memory specPrices
    ) external onlyOwner {
        require(nftCollections.length == nftIds.length, "PARAMS_INVALID");
        require(nftCollections.length == prices.length, "PARAMS_INVALID");
        require(nftCollections.length == specPrices.length, "PARAMS_INVALID");

        for(uint256 i = 0; i < nftCollections.length; i++){
            _PRICES_[nftCollections[i]][nftIds[i]] = prices[i];

            if(specPrices[i] == 0){
                _SPEC_PRICES_[nftCollections[i]][nftIds[i]] = prices[i].mul(_SPEC_FACTOR_).div(100);
            }else {
                _SPEC_PRICES_[nftCollections[i]][nftIds[i]] = specPrices[i];
            }

            if(_NFT_COLLECTION_IDS_[nftCollections[i]].length == 0) {
                _NFT_COLLECTIONS_.push(nftCollections[i]);
                _NFT_COLLECTION_IDS_[nftCollections[i]] = [nftIds[i]];

                require(++_CURRENT_NFT_AMOUNT_ <= _TOTAL_NFT_AMOUNT_, "OVERFLOW_NFT_AMOUNT");

            } else {
                uint256 j = 0;
                for(; j < _NFT_COLLECTION_IDS_[nftCollections[i]].length; i++) {
                    if(_NFT_COLLECTION_IDS_[nftCollections[i]][j] == nftIds[i]) {
                        break;
                    }
                }
                if(j == _NFT_COLLECTION_IDS_[nftCollections[i]].length) {
                    _NFT_COLLECTION_IDS_[nftCollections[i]].push(nftIds[i]);
                    require(++_CURRENT_NFT_AMOUNT_ <= _TOTAL_NFT_AMOUNT_, "OVERFLOW_NFT_AMOUNT");
                }
            }
        }
    }


    function setLotteryThreshold(uint256 newLotteryThreshold) external onlyOwner {
        _LOTTERY_THRESHOLD_ = newLotteryThreshold;
    }

    function setSpecFactor(uint256 newSpecFactor) external onlyOwner {
        _SPEC_FACTOR_ = newSpecFactor;
    }

    function setTotalNFTAmount(uint256 newTotalNFTAmount) external onlyOwner {
        _TOTAL_NFT_AMOUNT_ = newTotalNFTAmount;
    }

}
