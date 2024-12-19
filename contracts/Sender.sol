// SPDX-License-Identifier: MIT

pragma solidity ^0.8.22;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OApp, MessagingFee, Origin } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { MessagingReceipt } from "@layerzerolabs/oapp-evm/contracts/oapp/OAppSender.sol";

contract Sender is OApp {
    // Evento para notificar cuando se envía un mensaje
    event MessageSent(uint32 dstEid, string message, address sender);

    constructor(address _endpoint, address _delegate) OApp(_endpoint, _delegate) Ownable(_delegate) {}

    /**
     * @notice Envía un mensaje desde la cadena fuente a una cadena destino.
     * @param _dstEid El ID del endpoint de la cadena destino.
     * @param _message El mensaje en formato string a enviar.
     * @param _options Opciones adicionales para la ejecución del mensaje.
     * @dev Codifica el mensaje como bytes y lo envía usando la función interna `_lzSend`.
     * @return receipt Un struct `MessagingReceipt` con los detalles del mensaje enviado.
     */
    function send(
        uint32 _dstEid,
        string memory _message,
        bytes calldata _options
    ) external payable returns (MessagingReceipt memory receipt) {
        
        require(bytes(_message).length > 0, "Message cannot be empty");

        bytes memory _payload = abi.encode(_message);
        receipt = _lzSend(_dstEid, _payload, _options, MessagingFee(msg.value, 0), payable(msg.sender));

        emit MessageSent(_dstEid, _message, msg.sender);
    }

    /**
     * @notice Calcula la tarifa de gas necesaria para una transacción omnichain completa en gas nativo o token ZRO.
     * @param _dstEid El ID del endpoint de la cadena destino.
     * @param _message El mensaje.
     * @param _options Opciones para la ejecución del mensaje (por ejemplo, para enviar gas a la cadena destino).
     * @param _payInLzToken Indica si la tarifa se devuelve en tokens ZRO.
     * @return fee Un struct `MessagingFee` con la tarifa calculada en gas nativo o token ZRO.
     */
    function quote(
        uint32 _dstEid,
        string memory _message,
        bytes memory _options,
        bool _payInLzToken
    ) public view returns (MessagingFee memory fee) {
        bytes memory payload = abi.encode(_message);
        fee = _quote(_dstEid, payload, _options, _payInLzToken);
    }

    /**
     * @dev Dummy implemnetation to avoid making the contract abstract
     * @dev The receiving will be done from another contract
     */
    function _lzReceive(
        Origin calldata /*_origin*/,
        bytes32 /*_guid*/,
        bytes calldata /*payload*/,
        address /*_executor*/,
        bytes calldata /*_extraData*/
    ) internal override {
        //....
    }
}
