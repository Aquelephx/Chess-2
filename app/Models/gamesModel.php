<?php

namespace App\Models;

use CodeIgniter\Model;

class GamesModel extends Model{
    protected $table= 'games';
    protected $primaryKey= 'id';

    protected $allowedFields = [
        'current_fen',
        'status',
        'created_at'
    ];
     protected $returnType = 'array';
}
