
class Address{
    id:number;
    public_key:string;
    private_key:string;
    token_id:number|undefined;
    create_time:Date;
    update_time:Date|undefined;
    constructor(id:number, public_key:string,private_key:string,create_time:Date,token_id?:number,update_time?:Date) {
        this.id = id;
        this.public_key = public_key;
        this.private_key = private_key;
        this.create_time = create_time;

        this.token_id = token_id;
        this.update_time = update_time;
    }
}

export default Address;