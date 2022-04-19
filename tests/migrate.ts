const hre = require("hardhat");
import { ethers } from "hardhat";
import { Signer, Contract, ContractFactory, Overrides } from "ethers";

const fs = require("fs");
const file = fs.createWriteStream("../deploy-main-migration.txt", { flags: "a" });
let logger = new console.Console(file, file);
const { GetConfig } = require("../configAdapter.js");

import { FeeRateModel } from "./../typechain-types";
import { DODOApprove } from "./../typechain-types/DODOApprove";
import { DODOV2Proxy02__factory } from "./../typechain-types";
import { DODOMineV3Proxy__factory } from "./../typechain-types";
import { DODORouteProxy__factory } from "./../typechain-types";
import { DODODppProxy__factory } from "./../typechain-types/factories/DODODppProxy__factory";
import { DODOCpProxy__factory } from "./../typechain-types/factories/DODOCpProxy__factory";
import { DODODspProxy__factory } from "./../typechain-types/factories/DODODspProxy__factory";
import { UniAdapter__factory } from "./../typechain-types/factories/UniAdapter__factory";
import { DODOV2Adapter__factory } from "./../typechain-types/factories/DODOV2Adapter__factory";
import { DODOV1Adapter__factory } from "./../typechain-types/factories/DODOV1Adapter__factory";
import { DODOV2RouteHelper__factory } from "./../typechain-types/factories/DODOV2RouteHelper__factory";
import { DODOMineV2Factory__factory } from "./../typechain-types/factories/DODOMineV2Factory__factory";
import { DODOMineV3Registry__factory } from "./../typechain-types/factories/DODOMineV3Registry__factory";
import { UpCrowdPoolingFactory__factory } from "./../typechain-types/factories/UpCrowdPoolingFactory__factory";
import { CrowdPoolingFactory__factory } from "./../typechain-types/factories/CrowdPoolingFactory__factory";
import { DSPFactory__factory } from "./../typechain-types/factories/DSPFactory__factory";
import { DPPFactory__factory } from "./../typechain-types/factories/DPPFactory__factory";
import { DVMFactory__factory } from "./../typechain-types/factories/DVMFactory__factory";
import { ERC20V2Factory__factory } from "./../typechain-types/factories/ERC20V2Factory__factory";
import { DODOApproveProxy__factory } from "./../typechain-types/factories/DODOApproveProxy__factory";
import { DODOApprove__factory } from "./../typechain-types/factories/DODOApprove__factory";
import { ERC20MineV3__factory } from "./../typechain-types/factories/ERC20MineV3__factory";
import { ERC20Mine__factory } from "./../typechain-types/factories/ERC20Mine__factory";
import { InitializableERC20__factory } from "./../typechain-types/factories/InitializableERC20__factory";
import { CP__factory } from "./../typechain-types/factories/CP__factory";
import { OGSPPAdmin__factory } from "./../typechain-types/factories/OGSPPAdmin__factory";
import { DSP__factory } from "./../typechain-types/factories/DSP__factory";
import { DVM__factory } from "./../typechain-types";
import { PermissionManager__factory } from "./../typechain-types/factories/PermissionManager__factory";
import { FeeRateImpl__factory } from "./../typechain-types/factories/FeeRateImpl__factory";
import { UserQuota__factory } from "./../typechain-types/factories/UserQuota__factory";
import { FeeRateModel__factory } from "./../typechain-types/factories/FeeRateModel__factory";
import { DODOV1PmmHelper__factory } from "./../typechain-types/factories/DODOV1PmmHelper__factory";
import { DODOCalleeHelper__factory } from "./../typechain-types/factories/DODOCalleeHelper__factory";
import { ERC20Helper__factory } from "./../typechain-types/factories/ERC20Helper__factory";
import { DODOSwapCalcHelper__factory } from "./../typechain-types/factories/DODOSwapCalcHelper__factory";
import { DODOSellHelper__factory } from "./../typechain-types/factories/DODOSellHelper__factory";
import { Multicall__factory } from "./../typechain-types/factories/Multicall__factory";
import { CloneFactory } from "../typechain-types/CloneFactory";
import { CustomMintableERC20 } from "../typechain-types/CustomMintableERC20";
import { CustomERC20 } from "../typechain-types/CustomERC20";
import { ERC20V3Factory } from "../typechain-types/ERC20V3Factory";
import { CloneFactory__factory } from "../typechain-types/factories/CloneFactory__factory";
import { CustomMintableERC20__factory } from "../typechain-types/factories/CustomMintableERC20__factory";
import { CustomERC20__factory } from "../typechain-types/factories/CustomERC20__factory";
import { ERC20V3Factory__factory } from "../typechain-types/factories/ERC20V3Factory__factory";

import { OGSPPool } from "../typechain-types/OGSPPool";
import { OGSPPool__factory } from "../typechain-types/factories/OGSPPool__factory";

export function getConfig() {
  const networkName = hre.network.name;
    console.log("NETWORK: " + networkName);
    let CONFIG = GetConfig(hre.network.name);
  
    if (CONFIG == null) {
      const errorString: string = "Missing config for: " + networkName
      console.log(errorString);
      throw new Error(errorString);
    }
    console.log("Config ok");
    return CONFIG
}

let CONFIG = getConfig();

// The name corresponds to the name in config, not the contract per se
export async function attachOrDeploy(
  contractName: string,
  factory: ContractFactory, 
  contractPromise?: Promise<Contract>) {
  console.log("ContractKey: " + contractName);
  const address: string = CONFIG[contractName];
  var contract: Contract;
  if (address == "") {
    console.log("Deploying new:");
    contract = contractPromise ? await contractPromise : await factory.deploy();
    await contract.deployed();
  } else if (address == undefined) {
    console.log("Please add " + contractName + " to config");
    throw new Error("Missing config value");
  } else {
    console.log("Deployment exists:");
    contract = factory.attach(CONFIG.contractName);
  }
  logger.log(contractName + " address: ", contract.address);
  return contract
}

export namespace erc20v3 {
  export type Input = {
    erc20: string;
  };

  export type Output = {
    erc20V3: ERC20V3Factory;
    customERC20: CustomERC20;
    customMintableERC20: CustomMintableERC20;
    cloneFactoryContract: CloneFactory;
  };

  // deploy of ERC20 V3
  export async function deployERC20_V3(config: Input): Promise<Output> {
    const factoryOfERC20V3 = (await ethers.getContractFactory(
      "ERC20V3Factory"
    )) as ERC20V3Factory__factory;

    const factoryOfCustomERC20 = (await ethers.getContractFactory(
      "CustomERC20"
    )) as CustomERC20__factory;

    const factoryOfCustomMintableERC20 = (await ethers.getContractFactory(
      "CustomMintableERC20"
    )) as CustomMintableERC20__factory;

    const factoryOfCloneFactory = (await ethers.getContractFactory(
      "CloneFactory"
    )) as CloneFactory__factory;

    const customERC20 = await attachOrDeploy("CustomERC20", factoryOfCustomERC20) as CustomERC20;
    const customMintableERC20 = await attachOrDeploy("CustomMintableERC20", factoryOfCustomMintableERC20) as CustomMintableERC20;
    const cloneFactoryContract = await attachOrDeploy("CloneFactory", factoryOfCloneFactory) as CloneFactory;

    const erc20V3Promise = factoryOfERC20V3.deploy(
      cloneFactoryContract.address,
      config.erc20,
      customERC20.address,
      customMintableERC20.address,
      "2000000000000000" //0.002
    );
    const erc20V3 = await attachOrDeploy("ERC20V3Factory", factoryOfERC20V3, erc20V3Promise) as ERC20V3Factory;

    return {
      erc20V3,
      customERC20,
      customMintableERC20,
      cloneFactoryContract,
    };
  }
}

export namespace core {
  export type Input = {
    deployer: Signer;
    multisigAddress: string;
    cloneFactoryAddress: string;
    // initializableERC20Address: string;
    // customERC20Address: string;
    defaultMaintainer: string;
  };

  export type Output = {};

  export async function deployDODO_V2(config: Input) {

    const builtFactories = {
      multicall: (await ethers.getContractFactory(
        "Multicall"
      )) as Multicall__factory,
      dodoSellHelper: (await ethers.getContractFactory(
        "DODOSellHelper"
      )) as DODOSellHelper__factory,
      dodoSwapCalcHelper: (await ethers.getContractFactory(
        "DODOSwapCalcHelper"
      )) as DODOSwapCalcHelper__factory,
      erc20helper: (await ethers.getContractFactory(
        "ERC20Helper"
      )) as ERC20Helper__factory,
      dodoCalleeHelper: (await ethers.getContractFactory(
        "DODOCalleeHelper"
      )) as DODOCalleeHelper__factory,
      dodoV1PmmHelper: (await ethers.getContractFactory(
        "DODOV1PmmHelper"
      )) as DODOV1PmmHelper__factory,
      feeRateModel: (await ethers.getContractFactory(
        "FeeRateModel"
      )) as FeeRateModel__factory,
      userQuota: (await ethers.getContractFactory(
        "UserQuota"
      )) as UserQuota__factory,
      feeRateImpl: (await ethers.getContractFactory(
        "FeeRateImpl"
      )) as FeeRateImpl__factory,
      permissionManager: (await ethers.getContractFactory(
        "PermissionManager"
      )) as PermissionManager__factory,
      dvmTemplate: (await ethers.getContractFactory("DVM")) as DVM__factory,
      dspTemplate: (await ethers.getContractFactory("DSP")) as DSP__factory,
      dppTemplate: (await ethers.getContractFactory("OGSPPool")) as OGSPPool__factory,
      dppAdminTemplate: (await ethers.getContractFactory(
        "OGSPPAdmin"
      )) as OGSPPAdmin__factory,
      cpTemplate: (await ethers.getContractFactory("CP")) as CP__factory,
      erc20initializable: (await ethers.getContractFactory(
        "InitializableERC20"
      )) as InitializableERC20__factory,

      erc20MineV3: (await ethers.getContractFactory(
        "ERC20MineV3"
      )) as ERC20MineV3__factory,
      erc20Mine: (await ethers.getContractFactory(
        "ERC20Mine"
      )) as ERC20Mine__factory,

      dodoApprove: (await ethers.getContractFactory(
        "DODOApprove"
      )) as DODOApprove__factory,
      dodoApproveProxy: (await ethers.getContractFactory(
        "DODOApproveProxy"
      )) as DODOApproveProxy__factory,

      erc20V2Factory: (await ethers.getContractFactory(
        "ERC20V2Factory"
      )) as ERC20V2Factory__factory,

      dvmFactory: (await ethers.getContractFactory(
        "DVMFactory"
      )) as DVMFactory__factory,
      dppFactory: (await ethers.getContractFactory(
        "DPPFactory"
      )) as DPPFactory__factory,
      dspFactory: (await ethers.getContractFactory(
        "DSPFactory"
      )) as DSPFactory__factory,

      crowdPoolingFactory: (await ethers.getContractFactory(
        "CrowdPoolingFactory"
      )) as CrowdPoolingFactory__factory,

      upCrowdPoolingFactory: (await ethers.getContractFactory(
        "UpCrowdPoolingFactory"
      )) as UpCrowdPoolingFactory__factory,

      dodoMineV3RegistryFactory: (await ethers.getContractFactory(
        "DODOMineV3Registry"
      )) as DODOMineV3Registry__factory,

      dodoMineV2Factory: (await ethers.getContractFactory(
        "DODOMineV2Factory"
      )) as DODOMineV2Factory__factory,
      dodoV2RouteHelper: (await ethers.getContractFactory(
        "DODOV2RouteHelper"
      )) as DODOV2RouteHelper__factory,
      dodoV1Adapter: (await ethers.getContractFactory(
        "DODOV1Adapter"
      )) as DODOV1Adapter__factory,
      dodoV2Adapter: (await ethers.getContractFactory(
        "DODOV2Adapter"
      )) as DODOV2Adapter__factory,
      uniAdapter: (await ethers.getContractFactory(
        "UniAdapter"
      )) as UniAdapter__factory,
      dodoDspProxy: (await ethers.getContractFactory(
        "DODODspProxy"
      )) as DODODspProxy__factory,
      dodoCpProxy: (await ethers.getContractFactory(
        "DODOCpProxy"
      )) as DODOCpProxy__factory,
      dodoDppProxy: (await ethers.getContractFactory(
        "DODODppProxy"
      )) as DODODppProxy__factory,
      dodoRouteProxy: (await ethers.getContractFactory(
        "DODORouteProxy"
      )) as DODORouteProxy__factory,
      dodoMineV3Proxy: (await ethers.getContractFactory(
        "DODOMineV3Proxy"
      )) as DODOMineV3Proxy__factory,
      dodoV2Proxy02: (await ethers.getContractFactory(
        "DODOV2Proxy02"
      )) as DODOV2Proxy02__factory,
    };

    // deploy multicall
    const buildContracts: Record<string, any> = {};

    buildContracts.multicall = await attachOrDeploy("MultiCall", builtFactories.multicall);

    buildContracts.dodoSellHelper = await attachOrDeploy("DODOSellHelper", builtFactories.dodoSellHelper);

    const dodoSwapCalcHelperPromise = builtFactories.dodoSwapCalcHelper.deploy(
      buildContracts.dodoSellHelper.address
    );
    buildContracts.dodoSwapHelper =
      await attachOrDeploy("DODOSwapCalcHelper", builtFactories.dodoSwapCalcHelper, dodoSwapCalcHelperPromise);

    buildContracts.erc20helper = await attachOrDeploy("ERC20Helper", builtFactories.erc20helper);
    
    const dodoCalleeHelperPromise = builtFactories.dodoCalleeHelper.deploy(CONFIG.WETH);
    buildContracts.dodoCalleeHelper = 
      await attachOrDeploy("DODOCalleeHelper", builtFactories.dodoCalleeHelper, dodoCalleeHelperPromise);

    buildContracts.dodoV1PmmHelper =
      await attachOrDeploy("DODOV1PmmHelper", builtFactories.dodoV1PmmHelper);

    const feeRateModel = await attachOrDeploy("FeeRateModel", builtFactories.feeRateModel);
    await feeRateModel.initOwner(await config.deployer.getAddress());

    buildContracts.feeRateModel = feeRateModel;

    buildContracts.userQuota = await attachOrDeploy("UserQuota", builtFactories.userQuota);

    // requires an init
    const feeRateImpl = await attachOrDeploy("FeeRateImpl", builtFactories.feeRateImpl);
    await feeRateImpl.init(
      config.multisigAddress,
      config.cloneFactoryAddress,
      buildContracts.userQuota.address
    );
    buildContracts.feeRateImpl = feeRateImpl;

    // requires an init
    const permissionManager = await attachOrDeploy("PermissionManager", builtFactories.permissionManager);
    await permissionManager.initOwner(config.multisigAddress);
    buildContracts.permissionManager = permissionManager;

    buildContracts.dvmTemplate = await attachOrDeploy("DVM", builtFactories.dvmTemplate);
    buildContracts.dspTemplate = await attachOrDeploy("DSP", builtFactories.dspTemplate);
    buildContracts.dppTemplate = await attachOrDeploy("DPP", builtFactories.dppTemplate);

    buildContracts.dppAdminTemplate =
      await attachOrDeploy("DPPAdmin", builtFactories.dppAdminTemplate);

    buildContracts.cpTemplate = await attachOrDeploy("CP", builtFactories.cpTemplate);

    buildContracts.erc20initializable =
      await attachOrDeploy("InitializableERC20", builtFactories.erc20initializable); // rename?

    buildContracts.erc20Mine = await attachOrDeploy("ERC20MineV2", builtFactories.erc20Mine); // rename?
    buildContracts.erc20MineV3 = await attachOrDeploy("ERC20MineV3", builtFactories.erc20MineV3);

    const dodoApproveContract = await attachOrDeploy("DODOApprove", builtFactories.dodoApprove);
    buildContracts.dodoApprove = dodoApproveContract;

    const dodoApproveProxyPromise = builtFactories.dodoApproveProxy.deploy(
      dodoApproveContract.address
    );
    const dodoApproveProxy = 
      await attachOrDeploy("DODOApproveProxy", builtFactories.dodoApproveProxy, dodoApproveProxyPromise);
    buildContracts.dodoApproveProxy = dodoApproveProxy;

    /* Not sure if needed for now
    // requires init
    const erc20V2FactoryPromise = builtFactories.erc20V2Factory.deploy(
      config.cloneFactoryAddress,
      config.initializableERC20Address,
      config.customERC20Address
    );
    const erc20V2Factory = 
      await attachOrDeploy("ERC20V2Factory", builtFactories.erc20V2Factory, erc20V2FactoryPromise);
    await erc20V2Factory.initOwner(await config.deployer.getAddress());
    buildContracts.erc20V2Factory = erc20V2Factory;
    */

    // requires init
    const dvmFactoryPromise = builtFactories.dvmFactory.deploy(
      config.cloneFactoryAddress,
      buildContracts.dvmTemplate.address,
      config.defaultMaintainer,
      buildContracts.feeRateModel.address
    );
    const dvmFactory = 
      await attachOrDeploy("DVMFactory", builtFactories.dvmFactory, dvmFactoryPromise);
    dvmFactory.initOwner(config.multisigAddress);
    buildContracts.dvmFactory = dvmFactory;

    // DPP Factory
    const dppFactoryPromise = builtFactories.dppFactory.deploy(
      config.cloneFactoryAddress,
      buildContracts.dppTemplate.address,
      buildContracts.dppAdminTemplate.address,
      config.defaultMaintainer,
      buildContracts.feeRateModel.address,
      buildContracts.dodoApproveProxy.address
    );
    const dppFactory = await attachOrDeploy("DPPFactory", builtFactories.dppFactory, dppFactoryPromise);
    dppFactory.initOwner(await config.deployer.getAddress());
    buildContracts.dppFactory = dppFactory;

    // builtFactories.permissionManager

    // requires init
    // UPCP Factory - UpCrowdPoolingFactory
    const upCrowdPoolingFactoryPromise =
      builtFactories.upCrowdPoolingFactory.deploy(
        config.cloneFactoryAddress,
        buildContracts.cpTemplate.address,
        buildContracts.dvmFactory.address,
        config.defaultMaintainer,
        buildContracts.feeRateModel.address,
        buildContracts.permissionManager.address
      );
    const upCrowdPoolingFactory = 
      await attachOrDeploy("UpCrowdPoolingFactory", builtFactories.upCrowdPoolingFactory, upCrowdPoolingFactoryPromise);
    await upCrowdPoolingFactory.initOwner(config.multisigAddress);
    buildContracts.upCrowdPoolingFactory = upCrowdPoolingFactory;

    // requires init
    // CP Factory - CrowdPoolingFactory
    const crowdPoolingFactoryPromise = builtFactories.crowdPoolingFactory.deploy(
      config.cloneFactoryAddress,
      buildContracts.cpTemplate.address,
      buildContracts.dvmFactory.address,
      config.defaultMaintainer,
      buildContracts.feeRateModel.address,
      buildContracts.permissionManager.address
    );
    const crowdPoolingFactory = 
      await attachOrDeploy("CrowdPoolingFactory", builtFactories.crowdPoolingFactory, crowdPoolingFactoryPromise);
    await crowdPoolingFactory.initOwner(config.multisigAddress);
    buildContracts.crowdPoolingFactory = crowdPoolingFactory;

    // requires init
    // DSP Factory Address
    const dspFactoryPromise = builtFactories.dspFactory.deploy(
      config.cloneFactoryAddress,
      buildContracts.dspTemplate.address,
      config.defaultMaintainer,
      buildContracts.feeRateModel.address
    );
    const dspFactory =
      await attachOrDeploy("DSPFactory", builtFactories.dspFactory, dspFactoryPromise);
    await dspFactory.initOwner(config.multisigAddress);
    buildContracts.dspFactory = dspFactory;

    // DODO Mine V2 Factory
    const dodoMineV2FactoryPromise = builtFactories.dodoMineV2Factory.deploy(
      config.cloneFactoryAddress,
      buildContracts.erc20Mine.address, // erc20mineV2 actually
      config.defaultMaintainer
    );
    const dodoMineV2Factory =
      await attachOrDeploy("DODOMineV2Factory", builtFactories.dodoMineV2Factory, dodoMineV2FactoryPromise);
    buildContracts.dodoMineV2Factory = dodoMineV2Factory;

    // requires init (proxy)
    // DODO mine V3 Registry
    const dodoMineV3RegistryFactory =
      await attachOrDeploy("DODOMineV3Registry", builtFactories.dodoMineV3RegistryFactory); // rename?
    await dodoMineV3RegistryFactory.initOwner(
      await config.deployer.getAddress()
    );
    buildContracts.dodoMineV3RegistryFactory = dodoMineV3RegistryFactory;

    // DODO V2 helper
    /* Unused
    buildContracts.dodoV2Helper = await builtFactories.dodoV2RouteHelper.deploy(
      buildContracts.dvmFactory.address,
      buildContracts.dppFactory.address,
      buildContracts.dspFactory.address
    );

    buildContracts.dodoV1Adapter = await builtFactories.dodoV1Adapter.deploy(
      buildContracts.dodoSellHelper.address
    );
    */

    buildContracts.dodoV2Adapter = await attachOrDeploy("DODOV2Adapter", builtFactories.dodoV2Adapter);
    buildContracts.uniAdapter = await attachOrDeploy("UniAdapter", builtFactories.uniAdapter);

    /** DODO V2 PROXY **/

    const dodoV2Proxy02Promise = builtFactories.dodoV2Proxy02.deploy(
      buildContracts.dvmFactory.address,
      CONFIG.WETH,
      buildContracts.dodoApproveProxy.address,
      buildContracts.dodoSellHelper.address
    );
    const dodoV2Proxy02 = 
      await attachOrDeploy("DODOV2Proxy", builtFactories.dodoV2Proxy02, dodoV2Proxy02Promise);
    buildContracts.dodoV2Proxy02 = dodoV2Proxy02;

    const dodoDspProxyPromise = builtFactories.dodoDspProxy.deploy(
      buildContracts.dspFactory.address,
      CONFIG.WETH,
      buildContracts.dodoApproveProxy.address
    );
    const dodoDspProxy = 
      await attachOrDeploy("DSPProxy", builtFactories.dodoDspProxy, dodoDspProxyPromise);
    buildContracts.dodoDspProxy = dodoDspProxy;

    const dodoCpProxyPromise = builtFactories.dodoCpProxy.deploy(
      CONFIG.WETH,
      buildContracts.crowdPoolingFactory.address,
      buildContracts.upCrowdPoolingFactory.address,
      buildContracts.dodoApproveProxy.address
    );
    const dodoCpProxy = 
      await attachOrDeploy("CpProxy", builtFactories.dodoCpProxy, dodoCpProxyPromise);
    buildContracts.dodoCpProxy = dodoCpProxy;

    const dodoDppProxyPromise = builtFactories.dodoDppProxy.deploy(
      CONFIG.WETH,
      buildContracts.dodoApproveProxy.address,
      buildContracts.dppFactory.address
    );
    const dodoDppProxy = 
      await attachOrDeploy("DPPProxy", builtFactories.dodoDppProxy, dodoDppProxyPromise);
    buildContracts.dodoDppProxy = dodoDppProxy;

    // dodo mine v3 proxy
    const dodoMineV3ProxyPromise = builtFactories.dodoMineV3Proxy.deploy(
      config.cloneFactoryAddress,
      buildContracts.erc20MineV3.address,
      buildContracts.dodoApproveProxy.address,
      buildContracts.dodoMineV3RegistryFactory.address
    );
    const dodoMineV3Proxy = 
      await attachOrDeploy("DODOMineV3Proxy", builtFactories.dodoMineV3Proxy, dodoMineV3ProxyPromise);
    await dodoMineV3Proxy.initOwner(config.multisigAddress);
    buildContracts.dodoMineV3Proxy = dodoMineV3Proxy;

    // DODO Route Proxy
    const dodoRouteProxyPromise = builtFactories.dodoRouteProxy.deploy(
      CONFIG.WETH,
      buildContracts.dodoApproveProxy.address
    );
    const dodoRouteProxy = 
      await attachOrDeploy("RouteProxy", builtFactories.dodoRouteProxy, dodoRouteProxyPromise);
    buildContracts.dodoRouteProxy = dodoRouteProxy;

    // ApproveProxy init以及添加ProxyList
    // INIT ALL
    let tx = await dodoApproveProxy.init(config.multisigAddress, [
      buildContracts.dodoV2Proxy02.address,
      buildContracts.dodoDspProxy.address,
      buildContracts.dodoCpProxy.address,
      buildContracts.dodoDppProxy.address,
      buildContracts.dodoMineV3Proxy.address,
      buildContracts.dodoRouteProxy.address,
    ]);
    console.log("DODOApproveProxy Init tx: ", tx.hash);

    await (buildContracts.dodoApprove as DODOApprove).init(
      config.multisigAddress,
      dodoApproveProxy.address
    );

    //Set FeeRateImpl
    await feeRateModel.setFeeProxy(buildContracts.feeRateImpl.address);
    await feeRateModel.transferOwnership(config.multisigAddress);

    /* Not sure if needed for now
    //ERC20V2Factory 设置fee
    await erc20V2Factory.changeCreateFee("100000000000000000");
    await erc20V2Factory.transferOwnership(config.multisigAddress);
    */

    //DODOMineV2Factory 设置个人账户为owner
    await dodoMineV2Factory.initOwner(config.multisigAddress);

    //DODOMineV3Registry add Proxy as admin
    await dodoMineV3RegistryFactory.addAdminList(
      dodoMineV3RegistryFactory.address
    );
    await dodoMineV3RegistryFactory.transferOwnership(config.multisigAddress);

    //DPPFactory add DODProxy as admin
    const dppFactoryInst = await builtFactories.dppFactory.attach(
      dppFactory.address
    );
    await dppFactoryInst.addAdminList(buildContracts.dodoDppProxy.address);
    await dppFactoryInst.transferOwnership(config.multisigAddress);

    return buildContracts;
  }
}

/*
export namespace ogs {
  export type Input = {
    deployer: Signer;
    wethAddress: string;
    multisigAddress: string;
    // initializableERC20Address: string;
    // customERC20Address: string;
    defaultMaintainer: string;
    cloneFactoryAddress?: string;
  };

  export type Output = {};

  export async function deployOGS(config: Input) {

    let CONFIG = getConfig();

    const builtFactories = {
      cloneFactoryFactory: (await ethers.getContractFactory(
        "CloneFactory"
      )) as CloneFactory__factory,
      dodoSellHelper: (await ethers.getContractFactory(
        "DODOSellHelper"
      )) as DODOSellHelper__factory,
      feeRateModel: (await ethers.getContractFactory(
        "FeeRateModel"
      )) as FeeRateModel__factory,
      feeRateImpl: (await ethers.getContractFactory(
        "FeeRateImpl"
      )) as FeeRateImpl__factory,
      dvmTemplate: (await ethers.getContractFactory("DVM")) as DVM__factory,
      dppTemplate: (await ethers.getContractFactory("OGSPPool")) as OGSPPool__factory,
      dppAdminTemplate: (await ethers.getContractFactory(
        "OGSPPAdmin"
      )) as OGSPPAdmin__factory,

      dodoApprove: (await ethers.getContractFactory(
        "DODOApprove"
      )) as DODOApprove__factory,
      dodoApproveProxy: (await ethers.getContractFactory(
        "DODOApproveProxy"
      )) as DODOApproveProxy__factory,

      dvmFactory: (await ethers.getContractFactory(
        "DVMFactory"
      )) as DVMFactory__factory,
      dppFactory: (await ethers.getContractFactory(
        "DPPFactory"
      )) as DPPFactory__factory,
      dodoV2Adapter: (await ethers.getContractFactory(
        "DODOV2Adapter"
      )) as DODOV2Adapter__factory,
      dodoDppProxy: (await ethers.getContractFactory(
        "DODODppProxy"
      )) as DODODppProxy__factory,
      dodoV2Proxy02: (await ethers.getContractFactory(
        "DODOV2Proxy02"
      )) as DODOV2Proxy02__factory,
    };

    // deploy multicall
    const buildContracts: Record<string, any> = {};

    const cloneFactory = await attachOrDeploy("CloneFactory", builtFactories.cloneFactoryFactory);
    config.cloneFactoryAddress = cloneFactory.address;

    const feeRateModel = await attachOrDeploy("FeeRateModel", builtFactories.feeRateModel);
    await feeRateModel.initOwner(await config.deployer.getAddress());

    buildContracts.feeRateModel = feeRateModel;

    buildContracts.dvmTemplate = await attachOrDeploy("DVM", builtFactories.dvmTemplate);

    const dvmFactoryPromise = builtFactories.dvmFactory.deploy(
      config.cloneFactoryAddress,
      buildContracts.dvmTemplate.address,
      config.defaultMaintainer,
      buildContracts.feeRateModel.address
    );
    const dvmFactory = 
      await attachOrDeploy("DVMFactory", builtFactories.dvmFactory, dvmFactoryPromise);
    dvmFactory.initOwner(config.multisigAddress);
    buildContracts.dvmFactory = dvmFactory;

    buildContracts.dppAdminTemplate =
      await attachOrDeploy("DPPAdmin", builtFactories.dppAdminTemplate);

    buildContracts.dppTemplate = await attachOrDeploy("DPP", builtFactories.dppTemplate);

    const dodoApproveContract = await attachOrDeploy("DODOApprove", builtFactories.dodoApprove);
    buildContracts.dodoApprove = dodoApproveContract;

    const dodoApproveProxyPromise = builtFactories.dodoApproveProxy.deploy(
      dodoApproveContract.address
    );
    buildContracts.dodoApproveProxy = 
      await attachOrDeploy("DODOApproveProxy", builtFactories.dodoApproveProxy, dodoApproveProxyPromise);

    // DPP Factory
    const dppFactoryPromise = builtFactories.dppFactory.deploy(
      config.cloneFactoryAddress,
      buildContracts.dppTemplate.address,
      buildContracts.dppAdminTemplate.address,
      config.defaultMaintainer,
      buildContracts.feeRateModel.address,
      buildContracts.dodoApproveProxy.address
    );
    const dppFactory = 
      await attachOrDeploy("DPPFactory", builtFactories.dppFactory, dppFactoryPromise);
    dppFactory.initOwner(await config.deployer.getAddress());
    buildContracts.dppFactory = dppFactory;

    buildContracts.dodoSellHelper =
      await attachOrDeploy("DODOSellHelper", builtFactories.dodoSellHelper);

    const dodoV2Proxy02 = await builtFactories.dodoV2Proxy02.deploy(
      buildContracts.dvmFactory.address,
      config.wethAddress,
      buildContracts.dodoApproveProxy.address,
      buildContracts.dodoSellHelper.address
    );
    buildContracts.dodoV2Proxy02 =

    const dodoDppProxy = await builtFactories.dodoDppProxy.deploy(
      config.wethAddress,
      buildContracts.dodoApproveProxy.address,
      buildContracts.dppFactory.address
    );
    buildContracts.dodoDppProxy = dodoDppProxy;
    // dodoDppProxy.init(await config.deployer.getAddress());
    // await dodoApproveProxy.initOwner(await config.deployer.getAddress());
    await dodoApproveProxy.init(
      await config.deployer.getAddress(),
      [
        buildContracts.dodoV2Proxy02?.address,
        buildContracts.dodoDspProxy?.address,
        buildContracts.dodoCpProxy?.address,
        buildContracts.dodoDppProxy.address,
        buildContracts.dodoMineV3Proxy?.address,
        buildContracts.dodoRouteProxy?.address,
      ].filter(Boolean)
    );

    return buildContracts;
  }
}
*/
