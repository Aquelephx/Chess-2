<?php

namespace App\Models;

use CodeIgniter\Model;

class GamesModel extends Model{

     protected $table = 'games';
    protected $primaryKey = 'id';

    protected $allowedFields = [
        'nome',
        'gmail',
        'senha'
    ];
    protected $returnType = 'array';
}