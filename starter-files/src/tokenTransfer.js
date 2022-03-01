import React from "react";
import { useEffect, useState } from "react";
import {
	UBCTokenContract,
	connectWallet,
	transferToken,
	loadTokenName,
	loadTokenAccountBalance,
	getCurrentWalletConnected,
} from "./util/interact.js";

import Ubclogo from "./ubc-logo.png";

const TokenTransfer = () => {
	//state variables
	const [walletAddress, setWallet] = useState("");
	const [status, setStatus] = useState("");

	const [tokenName, setTokenName] = useState("No connection to the network."); //default tokenName
	const [tokenBalance, settokenBalance] = useState(
		"No connection to the network."
	);

	const [toAddress, setToAddress] = useState("");

	//called only once
	useEffect(() => {
		async function fetchData() {
			if (walletAddress !== "") {
				const tokenBalance = await loadTokenAccountBalance(walletAddress);
				settokenBalance(tokenBalance);
			}
			const tokenName = await loadTokenName();
			setTokenName(tokenName);
			const { address, status } = await getCurrentWalletConnected();
			setWallet(address);
			setStatus(status);
			addWalletListener();
			addSmartContractListener();
		}
		fetchData();
	}, [walletAddress, tokenBalance]);

	function addSmartContractListener() {
		UBCTokenContract.events.Transfer({}, (error, data) => {
			console.log(data);
			if (error) {
				setStatus("😥 " + error.message);
			} else {
				setToAddress("");
				setStatus("token transfer completed");
			}
		});
	}

	function addWalletListener() {
		if (window.ethereum) {
			window.ethereum.on("accountsChanged", (accounts) => {
				if (accounts.length > 0) {
					setWallet(accounts[0]);
					setStatus(
						"👆🏽 input the transfer to addresst in the text-field above."
					);
				} else {
					setWallet("");
					setStatus("🦊 Connect to Metamask using the top right button.");
				}
			});
		} else {
			setStatus(
				<p>
					{" "}
					🦊{" "}
					<a target="_blank" href={`https://metamask.io/download.html`}>
						You must install Metamask, a virtual Ethereum wallet, in your
						browser.
					</a>
				</p>
			);
		}
	}

	const connectWalletPressed = async () => {
		const walletResponse = await connectWallet();
		setStatus(walletResponse.status);
		setWallet(walletResponse.address);
	};

	const onUpdatePressed = async () => {
		const { status } = await transferToken(walletAddress, toAddress);
		setStatus(status);
	};

	//the UI of our component
	return (
		<div id="container">
			<img id="logo" src={Ubclogo}></img>
			<button id="walletButton" onClick={connectWalletPressed}>
				{walletAddress.length > 0 ? (
					"Connected: " +
					String(walletAddress).substring(0, 6) +
					"..." +
					String(walletAddress).substring(38)
				) : (
					<span>Connect Wallet</span>
				)}
			</button>

			<h2 style={{ paddingTop: "50px" }}>Token Name:</h2>
			<p>{tokenName}</p>

			<h2 style={{ paddingTop: "50px" }}>Balance:</h2>
			<p>{tokenBalance}</p>

			<h2 style={{ paddingTop: "18px" }}>Transfer 1 UBC Token To:</h2>

			<div>
				<input
					type="text"
					placeholder="transfer token to:"
					onChange={(e) => setToAddress(e.target.value)}
					value={toAddress}
				/>
				<p id="status">{status}</p>

				{/* <button id="publish" onClick={onUpdatePressed}> */}
				<button
					id="publish"
					onClick={() => {
						console.log(" complete transferToken call by onUpdatePressed");
					}}
				>
					Transfer
				</button>
			</div>
		</div>
	);
};

export default TokenTransfer;
